'use strict'

const LunoUtil = require('./luno-util')
const debug = require('debug')('executer')

const TYPE_BUY = 'BID'
const TYPE_SELL = 'ASK'

const TICKER_EXPIRES_MS = 4500

function Executer (bitx, lunoConnector) {
  this._bitx = bitx
  this._lunoConnector = lunoConnector
  this._myOrders = {
    asks: [],
    bids: []
  }
}

Executer.prototype.buyOrder = function (price, callback) {
  this.makeBuyPosition(price, (err, data) => {
    if (err) {
      callback(err, null)
    } else {
      this.placeOrder(data, (err, data) => {
        if (!err) {
          this._myOrders.bids.push(data.order_id)
        }
        callback(err, data)
      })
    }
  })
}

Executer.prototype.sellOrder = function (price, callback) {
  this.makeSellPosition(price, (err, data) => {
    if (err) {
      callback(err, null)
    } else {
      this.placeOrder(data, (err, data) => {
        if (!err) {
          this._myOrders.asks.push(data.order_id)
        }
        callback(err, data)
      })
    }
  })
}

Executer.prototype.isBuyMarketable = function (price, callback) {
  this.getTicker((err, data) => {
    if (err) {
      return callback(err, null)
    }
    const ask = parseInt(data.ask, 10)
    price = parseInt(price, 10)
    return callback(null, ask <= price)
  })
}

Executer.prototype.isSellMarketable = function (price, callback) {
  this.getTicker((err, data) => {
    if (err) {
      return callback(err, null)
    }
    const bid = parseInt(data.bid, 10)
    price = parseInt(price, 10)
    return callback(null, bid >= price)
  })
}

Executer.prototype.getBestBuyPrice = function () {
  const orderBook = this._lunoConnector.getOrderbook()
  if (!orderBook) {
    return undefined
  }
  const ticker = LunoUtil.makeTicker(orderBook)
  let bestBidPrice = parseInt(ticker.bid)
  if ((parseInt(ticker.ask, 10) - bestBidPrice) > 1) {
    bestBidPrice++
  }
  return bestBidPrice.toFixed(2).toString()
}

Executer.prototype.getBestSellPrice = function (callback) {
  const orderBook = this._lunoConnector.getOrderbook()
  if (!orderBook) {
    return undefined
  }
  const ticker = LunoUtil.makeTicker(orderBook)
  let bestAskPrice = parseInt(ticker.ask, 10)
  if (bestAskPrice - (parseInt(ticker.bid, 10)) > 1) {
    bestAskPrice--
  }
  return bestAskPrice.toFixed(2).toString()
}

Executer.prototype.getTicker = function (callback) {
  if (this._ticker && ((this._ticker.timestamp + TICKER_EXPIRES_MS) > Date.now())) {
    console.log('ticker cache hit')
    callback(null, this._ticker.data)
  } else {
    console.log('ticker cache miss')
    this._bitx.getTicker((err, data) => {
      if (err) {
        callback(err, null)
      } else {
        this._ticker = {
          timestamp: Date.now(),
          data
        }
        callback(null, data)
      }
    })
  }
}

Executer.prototype.makeBuyPosition = function (price, notMarketable, callback) {
  if (!price) {
    const bestPrice = this.getBestBuyPrice()
    if (!bestPrice) {
      callback(new Error('Couldn\'t guess price'), null)
    }
    callback(null, { type: TYPE_BUY, volume: '0.0005', price: bestPrice })
  } else {
    if (notMarketable) {
      this.isBuyMarketable(price, (err, isMarketable) => {
        if (err) {
          callback(err, null)
        } else if (isMarketable === false) {
          callback(null, {type: TYPE_BUY, volume: '0.0005', price: price})
        }
        callback(new Error('Order is marketable'))
      })
    } else {
      callback(null, {type: TYPE_BUY, volume: '0.0005', price: price})
    }
  }
}

Executer.prototype.makeSellPosition = function (price, notMarketable, callback) {
  if (!price) {
    const bestPrice = this.getBestSellPrice()
    if (!bestPrice) {
      callback(new Error('Couldn\'t guess price'), null)
    }
    callback(null, { type: TYPE_SELL, volume: '0.0005', price: bestPrice })
  } else {
    if (notMarketable) {
      this.isSellMarketable('50000', (err, data) => {
        if (err) {
          callback(err, null)
        } else if (data === false) {
          callback(null, {type: TYPE_SELL, volume: '0.0005', price: price})
        }
        callback(new Error('Order is marketable'))
      })
    } else {
      callback(null, {type: TYPE_SELL, volume: '0.0005', price: price})
    }
  }
}

Executer.prototype.placeOrder = function (position, callback) {
  if (position.type === TYPE_BUY) {
    this._bitx.postBuyOrder(position.volume, position.price, callback)
  } else if (position.type === TYPE_SELL) {
    this._bitx.postSellOrder(position.volume, position.price, callback)
  } else {
    callback(new Error('Invalid order type'), null)
  }
}

function isOpenOrderSamePosition (openOrder, position) {
  return (openOrder.type === position.type && parseInt(openOrder.limit_price, 10) === parseInt(position.price, 10))
}

function calculateVolumeOnOrder (openOrders, position) {
  return openOrders.orders.reduce((acc, openOrder) => {
    if (isOpenOrderSamePosition(openOrder, position)) {
      acc = acc + LunoUtil.convertStringToSatoshis(openOrder.limit_volume)
    }
    return acc
  }, 0)
}

Executer.prototype._cancelOrdersAndCalculateNewOrder = function (openOrders, position) {
  let volumeOnOrder = calculateVolumeOnOrder(openOrders, position)
  const satoshisToOrder = LunoUtil.convertStringToSatoshis(position.volume)
  debug(volumeOnOrder, satoshisToOrder, position)
  while (volumeOnOrder > satoshisToOrder) {
    let orderToCancel = openOrders.orders.reduce((acc, openOrder) => {
      if (isOpenOrderSamePosition(openOrder, position) && (!acc.creation_timestamp || openOrder.creation_timestamp > acc.creation_timestamp)) {
        acc = openOrder
      }
      return acc
    }, {})
    this._bitx.stopOrder(orderToCancel.order_id, (err, data) => {
      console.log(err, data)
    })
    openOrders.orders.splice(openOrders.orders.indexOf(orderToCancel), 1)
    volumeOnOrder = volumeOnOrder - LunoUtil.convertStringToSatoshis(orderToCancel.limit_volume)
  }
  return satoshisToOrder - volumeOnOrder
}

Executer.prototype.updatePositions = function (positions) {
  const executer = this
  this.getMyOpenOrders((err, openOrders) => {
    if (err) {
      console.log(err)
    }
    if (!openOrders) {
      openOrders = {}
    }
    if (!openOrders.orders) {
      openOrders.orders = []
    }
    positions.forEach((position) => {
      const deltaOrder = this._cancelOrdersAndCalculateNewOrder(openOrders, position)
      if (deltaOrder !== 0) {
        position.volume = LunoUtil.convertSatoshisToDecimalString(deltaOrder)
        this.placeOrder(position, (err, data) => {
          if (err) {
            debug('placeOrder error', err)
          }
          const orderBook = executer._lunoConnector.getOrderbook()
          debug(data, orderBook.asks.filter((ask) => { return ask.id === data.order_id }), orderBook.bids.filter((bid) => { return bid.id === data.order_id }), orderBook.bids.filter((bid) => { return bid.id === 'BXKCYSQ2FR8J4CS' }))
        })
      }
      openOrders.orders = openOrders.orders.filter((openOrder) => { return (isOpenOrderSamePosition(openOrder, position) === false) })
    })
    openOrders.orders.forEach((openOrder) => {
      this._bitx.stopOrder(openOrder.order_id, (err, data) => console.log(err, data))
    })
  })
}

Executer.prototype.updateBuyPositions = function (positions) {
  const openBids = this.getMyOpenBids()
  if (openBids === undefined) {
    return undefined
  }
  if (!openBids) {
    openBids = []
  }
  positions.forEach((position) => {
    const deltaOrder = this._cancelOrdersAndCalculateNewOrder(openBids, position)
    if (deltaOrder !== 0) {
      position.volume = LunoUtil.convertSatoshisToDecimalString(deltaOrder)
      this.placeOrder(position, (err, data) => { console.log(err, data) })
    }
    openOrders.orders = openOrders.orders.filter((openOrder) => { return (isOpenOrderSamePosition(openOrder, position) === false) })
  })
  openOrders.orders.forEach((openOrder) => {
    this._bitx.stopOrder(openOrder.order_id, (err, data) => console.log(err, data))
  })
}

Executer.prototype.getMyOpenOrders = function (callback) {
  // this._bitx.getOrderList({state: 'PENDING'}, callback)
  const myOpenOrders = []
  const orderBook = this._lunoConnector.getOrderbook()
  if (!orderBook) {
    callback(new Error('No orderbook'), null)
  }
  myOpenOrders.push(orderBook.asks.filter((ask) => (this._myOrders.asks.indexOf(ask.id) !== -1)))
  myOpenOrders.push(orderBook.bids.filter((bid) => (this._myOrders.bids.indexOf(bid.id) !== -1)))
  return callback(null, myOpenOrders)
}

Executer.prototype.getMyOpenAsks = function (callback) {
  // this._bitx.getOrderList({state: 'PENDING'}, callback)
  const myOpenAsks = []
  const orderBook = this._lunoConnector.getOrderbook()
  if (!orderBook) {
    callback(new Error('No orderbook'), null)
  }
  myOpenAsks.push(orderBook.asks.filter((ask) => (this._myOrders.asks.indexOf(ask.id) !== -1)))
  return callback(null, myOpenAsks)
}

Executer.prototype.getMyOpenBids = function (callback) {
  // this._bitx.getOrderList({state: 'PENDING'}, callback)
  const myOpenBids = []
  const orderBook = this._lunoConnector.getOrderbook()
  if (!orderBook) {
    callback(new Error('No orderbook'), null)
  }
  myOpenBids.push(orderBook.bids.filter((bid) => (this._myOrders.bids.indexOf(bid.id) !== -1)))
  return callback(null, myOpenBids)
}

module.exports = Executer
