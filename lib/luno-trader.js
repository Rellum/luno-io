'use strict'

const BitX = require('bitx')

class LunoTrader {
  constructor () {
    this.bitx = BitX()
  }

  placeOrder (options) {
    const defaults = {
      type: 'BID',
      volume: '0.0005',
      price: '10'
    }
    options = Object.assign({}, defaults, options)
    this.bitx.postBuyOrder(options.volume, options.price)
  }

  get [Symbol.toStringTag] () {
    return 'luno-trader'
  }
}

module.exports = LunoTrader
