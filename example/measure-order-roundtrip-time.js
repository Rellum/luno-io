'use strict'

const debug = require('debug')('index')
const LunoConnector = require('../lib/luno-connector')
const BitX = require('bitx')

const credentials = require('../credentials-trade')

const lunoConnector = new LunoConnector(credentials)
const bitx = BitX(credentials.api_key_id, credentials.api_key_secret)

const orderIds = []

setTimeout(() => {
  debug('placing order')
  bitx.postBuyOrder('0.0005', '10', (err, data) => {
    debug(err, data)
    orderIds.push(data.order_id)
    orderIds.forEach((orderId) => {
      debug('orderId', orderId)
      debug(lunoConnector.lunoBook.getOrder(orderId))
    })
    lunoConnector.lunoBook.eventEmitter.on('marketChange', () => {
      debug('marketChange')
      orderIds.forEach((orderId) => {
        debug('orderId', orderId)
        debug(lunoConnector.lunoBook.getOrder(orderId))
      })
    })
  })
}, 10000)
