'use strict'

const debug = require('debug')('index')
const LunoConnector = require('../lib/luno-connector')

const credentials = require('../credentials')

const lunoConnector = new LunoConnector(credentials)

setInterval(() => debug(lunoConnector.lunoBook.getTicker()), 2000)
setInterval(() => console.log(lunoConnector.lunoBook.getMaxBidPrice(), lunoConnector.lunoBook.getMinAskPrice()), 2000)
