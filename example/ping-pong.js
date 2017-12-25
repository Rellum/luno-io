'use strict'

const debug = require('debug')('pingPong')
const LunoConnector = require('../lib/luno-connector')
const LunoTrader = require('../lib/luno-trader')

const credentials = require('../credentials')
const tradeCredentials = require('../credentials-trade')

const lunoConnector = new LunoConnector(credentials)
const lunoTrader = new LunoTrader(lunoConnector.lunoBook, tradeCredentials)

setTimeout(function startPingPong () {
  lunoTrader.placeOrder({price: 100000, notMarketable: true}).then((value) => debug(value))
}, 3000)
