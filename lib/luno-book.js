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

LunoBook.prototype.state = function (state) {
  if (state) {
    debug('starting to process', state.sequence)
    const lunoBook = this
    if (state.asks && state.bids) {
      this._orders = []
      state.asks.forEach(function (ask) {
        ask.type = 'ASK'
        lunoBook._orders.push(LunoOrder(ask))
      })
      state.bids.forEach(function (bid) {
        bid.type = 'BID'
        lunoBook._orders.push(LunoOrder(bid))
      })
      this._timestamp = state.timestamp || null
      this._sequence = state.sequence
      this._trades = []
      this._deletedOrders = []
      this._isLive = true
      this.eventEmitter.emit('marketChange', 'initialized')
      return true
    } else if (this.isLive()) {
      if ((parseInt(this._sequence) + 1).toString() === state.sequence) {
        if (state.create_update) {
          lunoBook._orders.push(LunoOrder(state.create_update))
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
        return true
      } else {
        this.flush()
        return false
      }
    }
    return false
  } else if (this._orders) {
    return {
      asks: this._orders
        .filter(function (order) { return order.getType() === 'ASK' })
        .sort(function(a, b) {
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
        .sort(function(a, b) {
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
      trades: this._trades,
    }

  } else {
    return null
  }
}

LunoBook.prototype.getOrder = function (orderId) {
  return this._orders.find((order) => {
    return order.isId(orderId)
  })
}

LunoBook.prototype.getMaxBidPrice = function (options) {
  if (this._orders) {
    return this._orders.reduce((max, order) => {
      if (order.getType() !== 'BID' || (options && options.exclude && options.exclude.indexOf(order.getId()) !== -1)) {
        return max
      }
      return Math.max(max, order.getPrice())
    }, Number.NEGATIVE_INFINITY)
  }
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
    let lastTrade = null
    if (this._trades[0]) {
      lastTrade = parseFloat(this._trades[0].price)
    }
    return {
      ask: this.getMinAskPrice(options),
      timestamp: this._timestamp,
      bid: this.getMaxBidPrice(options),
      rolling_24_hour_volume: '12.52', // not implemented
      last_trade: lastTrade
    }
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

LunoBook.prototype.eventEmitter = new event.EventEmitter()

module.exports = LunoBook
