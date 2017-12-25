'use strict'

const debug = require('debug')('trader')

const BitX = require('bitx')
const LunoOrder = require('./luno-order')

class LunoTrader {
  constructor (lunoBook, credentials, options) {
    const lunoTrader = this
    this.bitx = BitX(credentials.api_key_id, credentials.api_key_secret)
    this.lunoBook = lunoBook
    this.activeTrades = []
    this.lunoBook.eventEmitter.once('marketChange', function () {
      lunoTrader.getActiveOrders()
    })
    this._options = options
  }

  getActiveOrders () {
    const lunoTrader = this
    this.bitx.getOrderList({state: 'PENDING'}, (e, d) => {
      debug('orderlist', e, d)
      if (e) {
        setTimeout(lunoTrader.getActiveOrders, 3000)
      } else if (d.orders) {
        d.orders.forEach((pendingOrder) => {
          lunoTrader.activeTrades.push(pendingOrder.order_id)
        })
        if (lunoTrader._options && lunoTrader._options.clearExistingOrders && lunoTrader._options.clearExistingOrders === true) {
          lunoTrader.clearOrders(this.activeTrades)
        }
      }
    })
  }

  clearOrders (orders) {
    const lunoTrader = this
    orders.forEach((orderId) => {
      lunoTrader.bitx.stopOrder(orderId, function retryStopOrderIfNecessary (e, d) {
        if (e) {
          debug('stop order error', orderId, e)
          return setTimeout(() => {
            lunoTrader.bitx.stopOrder(orderId, retryStopOrderIfNecessary)
          }, 1500)
        }
        debug('stopped order', orderId, d)
      })
    })
  }

  placeOrder (options) {
    const lunoTrader = this
    const defaults = {
      type: 'BID',
      volume: '0.0005',
      price: '10'
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

  exchange (options) {
    const lunoTrader = this
    const order = {
      type: 'BID'
    }
    if (options && options.fromAmount) {
      order.type = (options.fromAmount.getCurrencyId() === 'ZAR') ? 'BID' : order.type
      order.type = (options.fromAmount.getCurrencyId() === 'XBT') ? 'ASK' : order.type
      order.volume = options.fromAmount.toString()
    }
    const priceOptions = {
      fromCurrency: 'ZAR',
      toCurrency: 'XBT'
    }
    if (order.type === 'ASK') {
      priceOptions.fromCurrency = 'XBT'
      priceOptions.toCurrency = 'ZAR'
    }
    order.price = this.lunoBook.getBestPrice(priceOptions)
    return new Promise(function promise (resolve, reject) {
      lunoTrader.placeOrder(order)
        .then(function orderReflected (orderId) {
          debug('order placed', orderId)
          lunoTrader.lunoBook.getOrderAsync(orderId)
            .then(function (order) {
              debug('order reflected in book', orderId)
              function checkIfOrderIsFilled () {
                debug('checking whether order is filled', orderId)
                if (!lunoTrader.lunoBook.getOrder(orderId)) {
                  lunoTrader.lunoBook.eventEmitter.removeListener('marketChange', checkIfOrderIsFilled)
                  debug('order filled', orderId)
                  resolve('order filled')
                }
              }
              checkIfOrderIsFilled()
              lunoTrader.lunoBook.eventEmitter.on('marketChange', checkIfOrderIsFilled)
            })
            .catch(function (err) {
              // reject(new Error('Order did not reflect'))
              reject(err)
            })
        })
        .catch(function (err) {
          // reject(new Error('Order was not placed'))
          reject(err)
        })
    })
  }

  get [Symbol.toStringTag] () {
    return 'luno-trader'
  }
}

module.exports = LunoTrader
