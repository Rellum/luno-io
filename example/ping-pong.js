'use strict'

const debug = require('debug')('pingPong')
const LunoConnector = require('../lib/luno-connector')
const LunoTrader = require('../lib/luno-trader')
const LunoCurrency = require('../lib/luno-currency')

const credentials = require('../credentials')
const tradeCredentials = require('../credentials-trade')

const lunoConnector = new LunoConnector(credentials)
const lunoTrader = new LunoTrader(lunoConnector.lunoBook, tradeCredentials, {clearExistingOrders: true})

setTimeout(function startPingPong (pingPong) {
  const options = {}
  if (pingPong && pingPong === 'pong') {
    options.fromAmount = new LunoCurrency(0.0005, 'XBT')
  }
  lunoTrader.exchange(options)
    .then((value) => {
      debug('pinged', value)
      startPingPong((pingPong === 'pong') ? 'ping' : 'pong')
    })
    .catch((err) => {
      debug('punged', err)
      startPingPong(pingPong)
    })
}, 3000)
