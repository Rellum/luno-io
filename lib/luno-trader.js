'use strict'

const debug = require('debug')('trader')

const BitX = require('bitx')
const LunoOrder = require('./luno-order')

class LunoTrader {
  constructor (lunoBook, credentials) {
    const lunoTrader = this
    this.bitx = BitX(credentials.api_key_id, credentials.api_key_secret)
    this.lunoBook = lunoBook
    this.activeTrades = []
    this.lunoBook.eventEmitter.on('marketChange', function () {
      lunoTrader.activeTrades.forEach(function (activeTrade) {
        const order = lunoTrader.lunoBook.getOrder(activeTrade)
        debug('vaughan', order, activeTrade)
        if (order) {
          debug('trade', activeTrade, 'placed')
        }
      })
    })
  }

  placeOrder (options) {
    const lunoTrader = this
    const defaults = {
      type: 'BID',
      volume: '0.0005',
      price: '215000'
    }
    options = Object.assign({}, defaults, options)
    const lunoOrder = new LunoOrder(options)
    return new Promise(function (resolve, reject) {
      if (options.notMarketable && lunoTrader.lunoBook.isOrderMarketable(lunoOrder)) {
        reject(new Error('Not marketable'))
        return
      }
      if (options.type === 'BID') {
        lunoTrader.bitx.postBuyOrder(options.volume, options.price, (e, d) => {
          debug(e, d)
          if (e) {
            reject(e)
          } else {
            lunoTrader.activeTrades.push(d.order_id)
            resolve(d.order_id)
          }
        })
      } else if (options.type === 'ASK') {
        lunoTrader.bitx.postSellOrder(options.volume, options.price, (e, d) => {
          debug(e, d)
          if (e) {
            reject(e)
          } else {
            lunoTrader.activeTrades.push(d.order_id)
            resolve(d.order_id)
          }
        })
      }
    })
  }

  get [Symbol.toStringTag] () {
    return 'luno-trader'
  }
}

module.exports = LunoTrader
