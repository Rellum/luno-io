'use strict'

const queue = require('queue')

const W3cWebsocket = require('websocket').w3cwebsocket
const LunoBook = require('./luno-book')

const LunoConnector = function (credentials) {
  this._credentials = credentials
  this.connect()
}

LunoConnector.prototype.connect = function () {
  this.lunoBook = new LunoBook()

  this._q = queue()
  this._q.concurrency = 1
  this._q.autostart = true

  const LunoConnector = this

  this._ws = new W3cWebsocket('wss://ws.luno.com/api/1/stream/XBTZAR')

  this._ws.onopen = () => {
    this._ws.send(JSON.stringify(this._credentials))
  }

  const processMessage = function (message) {
    if (!LunoConnector.lunoBook.state(JSON.parse(message.data))) {
      LunoConnector.reset()
    }
  }

  this._ws.onmessage = function (message) {
    LunoConnector._q.push((callback) => { processMessage(message); callback() })
  }
}

LunoConnector.prototype.reset = function () {
  this.connect()
}

LunoConnector.prototype.getOrderbook = function () {
  return this.lunoBook.state()
}

module.exports = LunoConnector
