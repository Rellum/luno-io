'use strict'

const debug = require('debug')('index')
const LunoUtil = require('./lib/luno-util')
const LunoConnector = require('./lib/luno-connector')

const credentials = require('./credentials')

const lunoConnector = new LunoConnector(credentials)

setInterval(() => debug(lunoConnector.lunoBook.getTicker()), 2000)
