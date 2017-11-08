'use strict'

const debug = require('debug')('index')
const LunoUtil = require('./lib/luno-util')
const LunoConnector = require('./lib/luno-connector')

const credentials = require('./credentials')

const lunoConnector = new LunoConnector(credentials)

setInterval(() => debug(LunoUtil.makeTicker(lunoConnector.getOrderbook())), 2000)
