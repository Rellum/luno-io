'use strict'

const queue = require('queue')
const debug = require('debug')('connector')
const W3cWebsocket = require('websocket').w3cwebsocket
const LunoBook = require('./luno-book')

const LunoConnector = function (credentials) {
  this._credentials = credentials

  this._q = queue()
  this._q.concurrency = 1
  this._q.autostart = true

  this.start()
}

LunoConnector.prototype.start = function () {
  const LunoConnector = this
  this.lunoBook = new LunoBook()

  this._ws = new W3cWebsocket('wss://ws.luno.com/api/1/stream/XBTZAR')
  // this._ws = new W3cWebsocket('wss://ws.luno.com/api/1/stream/ETHXBT')

  this._ws.onopen = () => {
    debug('open')
    this._ws.send(JSON.stringify(this._credentials))
  }

  const processMessage = function (message) {
    if (!LunoConnector.lunoBook.state(JSON.parse(message.data))) {
      LunoConnector.reset()
    }
  }

  this._ws.onmessage = function (message) {
    debug('message')
    LunoConnector._q.push((callback) => { processMessage(message); callback() })
  }
}

LunoConnector.prototype.reset = function () {
  debug('reset')
  this._ws.close()
  this._q.end()
  this.start()
}

LunoConnector.prototype.getOrderbook = function () {
  return this.lunoBook.state()
}

module.exports = LunoConnector
