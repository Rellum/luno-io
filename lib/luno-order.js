'use strict'

const lunoUtil = require('./luno-util')

const Order = function() {
  return {
    [Symbol.toStringTag]: 'luno-order',
    getVolume: function () {
      return this._volume
    },
    setVolume: function (volume) {
      this._volume = parseFloat(volume)
    },
    getId: function () {
      return this._id
    },
    setId: function (id) {
      this._id = id
      return true
    },
    isId: function (id) {
      return this._id === id
    },
    setPrice: function (price) {
      this._price = parseFloat(price)
    },
    getPrice: function () {
      return this._price
    },
    setType: function (type) {
      this._type = type
    },
    getType: function () {
      return this._type
    },
    reduceVolume: function (volumeChange) {
      this._volume = parseFloat(lunoUtil.convertSatoshisToDecimalString(lunoUtil.convertStringToSatoshis(this._volume) - lunoUtil.convertStringToSatoshis(volumeChange)))
    },
    processTradeUpdate: function (tradeUpdate) {
      if (this.isId(tradeUpdate.order_id)) {
        this.reduceVolume(tradeUpdate.base)
      }
    }
  }
}

const LunoOrder = function (options) {
  const order = new Order()
  if (options) {
    if (options.id) {
      order.setId(options.id)
    } else if (options.order_id) {
      order.setId(options.order_id)
    }
    if (options.volume) {
      order.setVolume(options.volume)
    }
    if (options.price) {
      order.setPrice(options.price)
    }
    if (options.type) {
      order.setType(options.type)
    }
  }
  return order
}

module.exports = LunoOrder
