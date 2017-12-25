'use strict'

const LunoOrder = require('./luno-order')
const event = require('events')
const debug = require('debug')('book')

const LunoBook = function () {
  this._isLive = false
}

LunoBook.prototype._processTradeUpdate = function (tradeUpdate, timestamp) {
  const orderIndex = this._orders.findIndex(function (order) { return order.isId(tradeUpdate.order_id) })
  const order = this._orders[orderIndex]
  const updatedOrder = order.processTradeUpdate(tradeUpdate)
  if (updatedOrder.getVolume() === 0) {
    debug('removing order')
    this._orders.splice(orderIndex, 1)
    this._deletedOrders.push(tradeUpdate.order_id)
  }
  this._trades.push({
    volume: tradeUpdate.base,
    timestamp: timestamp,
    price: (tradeUpdate.counter / tradeUpdate.base).toFixed(2),
    is_buy: order.getType() === 'ASK'
  })
}

LunoBook.prototype._processTradeUpdates = function (tradeUpdates, timestamp) {
  tradeUpdates.forEach((tradeUpdate) => this._processTradeUpdate(tradeUpdate, timestamp))
}

LunoBook.prototype._isInitialisationUpdate = function (update) {
  return (update.asks && update.bids)
}

LunoBook.prototype._appendOrder = function (order) {
  this._orders.push(LunoOrder(order))
}

LunoBook.prototype._processInitialAsks = function (asks) {
  const lunoBook = this
  asks.forEach(function (ask) {
    ask.type = 'ASK'
    lunoBook._appendOrder(ask)
  })
}

LunoBook.prototype._processInitialBids = function (bids) {
  const lunoBook = this
  bids.forEach(function (bid) {
    bid.type = 'BID'
    lunoBook._appendOrder(bid)
  })
}

LunoBook.prototype._setInitialState = function (initialisationMessage) {
  this._orders = []
  this._processInitialAsks(initialisationMessage.asks)
  this._processInitialBids(initialisationMessage.bids)
  this._timestamp = initialisationMessage.timestamp || null
  this._sequence = initialisationMessage.sequence
  this._trades = []
  this._deletedOrders = []
  this._isLive = true
  this.eventEmitter.emit('marketChange', 'initialized')
  return true
}

LunoBook.prototype._checkSequence = function (sequence) {
  return ((parseInt(this._sequence) + 1).toString() === sequence)
}

LunoBook.prototype._getState = function () {
  if (this._orders) {
    return {
      asks: this._orders
        .filter(function (order) { return order.getType() === 'ASK' })
        .sort(function (a, b) {
          if (a.getPrice() < b.getPrice()) {
            return -1
          } else if (a.getPrice() === b.getPrice() && a.getId() < b.getId()) {
            return -1
          } else {
            return 1
          }
        })
        .map(order => order.toSimple()),
      bids: this._orders
        .filter(function (order) { return order.getType() === 'BID' })
        .sort(function (a, b) {
          if (a.getPrice() > b.getPrice()) {
            return -1
          } else if (a.getPrice() === b.getPrice() && a.getId() < b.getId()) {
            return -1
          } else {
            return 1
          }
        })
        .map(order => order.toSimple()),
      sequence: this._sequence,
      timestamp: this._timestamp,
      trades: this._trades
    }
  } else {
    return null
  }
}

LunoBook.prototype.state = function (state) {
  if (state) {
    debug('starting to process', state.sequence)
    const lunoBook = this
    if (this._isInitialisationUpdate(state)) {
      return this._setInitialState(state)
    } else if (this.isLive()) {
      if (this._checkSequence(state.sequence)) {
        let createdOrder = null
        if (state.create_update) {
          createdOrder = LunoOrder(state.create_update)
          debug('orderCreating', createdOrder.getId())
          lunoBook._orders.push(createdOrder)
        }
        if (state.trade_updates) {
          this._processTradeUpdates(state.trade_updates, state.timestamp)
        }
        if (state.delete_update) {
          this._orders.splice(this._orders.findIndex(order => order.isId(state.delete_update.order_id)), 1)
          this._deletedOrders.push(state.delete_update.order_id)
        }
        this._timestamp = state.timestamp
        this._sequence = state.sequence
        debug('finished processing', state.sequence)
        this.eventEmitter.emit('marketChange', 'update')
        if (createdOrder) {
          debug('orderCreated', createdOrder.getId())
          this.eventEmitter.emit('orderCreated', createdOrder)
        }
        return true
      } else {
        this.flush()
        return false
      }
    }
    return false
  } else {
    return this._getState()
  }
}

LunoBook.prototype.getOrder = function (orderId) {
  return this._orders.find((order) => {
    if (order.isId(orderId)) {
    }
    return order.isId(orderId)
  })
}

LunoBook.prototype.getMinAskPrice = function (options) {
  if (this._orders) {
    return this._orders.reduce((min, order) => {
      if (order.getType() !== 'ASK' || (options && options.exclude && options.exclude.indexOf(order.getId()) !== -1)) {
        return min
      }
      return Math.min(min, order.getPrice())
    }, Number.POSITIVE_INFINITY)
  }
}

LunoBook.prototype.getTicker = function (options) {
  if (this.isLive()) {
    const ticker = {
      ask: this.getMinAskPrice(options),
      timestamp: this._timestamp,
      bid: this.getBestPrice(Object.assign({fromCurrency: 'ZAR', toCurrency: 'XBT'}, options)),
      rolling_24_hour_volume: null, // not implemented
      last_trade: null
    }
    if (this._trades[0]) {
      ticker.last_trade = parseFloat(this._trades[this._trades.length - 1].price)
      ticker.rolling_24_hour_volume = this._trades.reduce((volume, trade) => {
        return parseFloat(parseFloat(volume) + parseFloat(trade.volume)).toFixed(3)
      }, 0)
    }
    return ticker
  }
}

LunoBook.prototype.getDeletedOrders = function (options) {
  return this._deletedOrders
}

LunoBook.prototype.flush = function () {
  if (this.isLive()) {
    this._isLive = false
    this._orders = undefined
    this._sequence = undefined
    this._timestamp = undefined
    return true
  } else {
    return false
  }
}

LunoBook.prototype.isLive = function () {
  return this._isLive
}

LunoBook.prototype.getBidDepth = function (options) {
  if (this.isLive() && options && options.price) {
    return this._orders.reduce((depth, order) => {
      if (order.getType() !== 'BID' || (options.exclude && options.exclude.indexOf(order.getId()) !== -1)) {
        return depth
      }
      return (order.getPrice() >= options.price) ? depth + order.getVolume() : depth
    }, 0.0)
  }
}

LunoBook.prototype.getAskDepth = function (options) {
  if (this.isLive() && options && options.price) {
    return this._orders.reduce((depth, order) => {
      if (order.getType() !== 'ASK' || (options.exclude && options.exclude.indexOf(order.getId()) !== -1)) {
        return depth
      }
      return (order.getPrice() <= options.price) ? Math.round((depth + order.getVolume()) * 100) / 100 : depth
    }, 0.0)
  }
}

LunoBook.prototype.isOrderMarketable = function (order) {
  if (order.getType() === 'ASK') {
    const depth = this.getBidDepth({ price: order.getPrice() })
    const isDeepEnough = (typeof depth === 'undefined' || typeof order.getVolume() === 'undefined' || depth >= order.getVolume())
    return (order.getPrice() <= this.getBestPrice({fromCurrency: 'ZAR', toCurrency: 'XBT'}) && isDeepEnough)
  } else if (order.getType() === 'BID') {
    const depth = this.getAskDepth({ price: order.getPrice() })
    const isDeepEnough = (typeof depth === 'undefined' || typeof order.getVolume() === 'undefined' || depth >= order.getVolume())
    return (order.getPrice() >= this.getMinAskPrice() && isDeepEnough)
  }
}

LunoBook.prototype.getBidAskDirection = function (options) {
  if (!options) {
    return null
  }
  if (options.fromCurrency && options.fromCurrency === 'ZAR' && options.toCurrency === 'XBT') {
    return 'BID'
  }
  if (options.fromCurrency && options.fromCurrency === 'XBT' && options.toCurrency === 'ZAR') {
    return 'ASK'
  }
  return undefined
}

LunoBook.prototype.getBestPrice = function (options) {
  if (this._orders) {
    const direction = this.getBidAskDirection(options)
    console.log(options, direction)
    if (direction === null) {
      const ticker = this._orders.reduce((acc, order) => {
        if (order.getType() === 'BID' && order.getPrice() > acc.maxBidPrice) {
          acc.maxBidPrice = order.getPrice()
        }
        if (order.getType() === 'ASK' && order.getPrice() < acc.minAskPrice) {
          acc.minAskPrice = order.getPrice()
        }
        return acc
      }, {maxBidPrice: Number.NEGATIVE_INFINITY, minAskPrice: Number.POSITIVE_INFINITY})
      return (ticker.maxBidPrice + ticker.minAskPrice) / 2
    } else if (direction === 'ASK') {
      return this._orders.reduce((min, order) => {
        if (order.getType() !== 'ASK' || (options && options.exclude && options.exclude.indexOf(order.getId()) !== -1)) {
          return min
        }
        return Math.min(min, order.getPrice())
      }, Number.POSITIVE_INFINITY)
    } else if (direction === 'BID') {
      return this._orders.reduce((max, order) => {
        if (order.getType() !== 'BID' || (options && options.exclude && options.exclude.indexOf(order.getId()) !== -1)) {
          return max
        }
        return Math.max(max, order.getPrice())
      }, Number.NEGATIVE_INFINITY)
    }
  }
}

LunoBook.prototype.eventEmitter = new event.EventEmitter()

module.exports = LunoBook
