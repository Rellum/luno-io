'use strict'

const LunoUtil = require('./luno-util')

const LunoBook = function () {}

function formatOrderUpdate (orderUpdate) {
  delete orderUpdate.type
  Object.defineProperty(orderUpdate, 'id', Object.getOwnPropertyDescriptor(orderUpdate, 'order_id'))
  delete orderUpdate['order_id']
  return orderUpdate
}

function getIndexToInsertBid (bids, price) {
  let index = bids.findIndex((bid) => { return bid.price < price })
  return (index !== -1) ? index : bids.length
}

function getIndexToInsertAsk (asks, price) {
  let index = asks.findIndex((ask) => { return ask.price <= price })
  return (index !== -1) ? index : asks.length
}

LunoBook.prototype._insertBid = function (newOrder) {
  this._state.bids.splice(
    getIndexToInsertBid(this._state.bids, newOrder.price),
    0,
    formatOrderUpdate(newOrder)
  )
}

LunoBook.prototype._insertAsk = function (newOrder) {
  this._state.asks.splice(
    getIndexToInsertAsk(this._state.asks, newOrder.price),
    0,
    formatOrderUpdate(newOrder)
  )
}

LunoBook.prototype._deleteBidByIndex = function (index) {
  this._state.bids.splice(index, 1)
}

LunoBook.prototype._deleteAskByIndex = function (index) {
  this._state.asks.splice(index, 1)
}

LunoBook.prototype.state = function (state) {
  if (state) {
    if (state.asks && state.bids) {
      this._state = state
      return true
    } else if ((parseInt(this._state.sequence) + 1).toString() === state.sequence) {
      if (state.create_update) {
        if (state.create_update.type === 'BID') {
          this._insertBid(state.create_update)
        } else if (state.create_update.type === 'ASK') {
          this._insertAsk(state.create_update)
        } else {
          //untested
        }
      }
      if (state.trade_updates) {
        if (!this._state.trades) {
          this._state.trades = []
        }
        state.trade_updates.forEach((tradeUpdate) => {
          this._state.bids.forEach((bid, index) => {
            if (tradeUpdate.order_id === bid.id) {
              bid.volume = LunoUtil.convertSatoshisToDecimalString(LunoUtil.convertStringToSatoshis(bid.volume) - LunoUtil.convertStringToSatoshis(tradeUpdate.base))
              if (bid.volume === "0") {
                this._deleteBidByIndex(index)
              }
              this._state.trades.push({
                volume: tradeUpdate.base,
                timestamp: state.timestamp,
                price: (tradeUpdate.counter / tradeUpdate.base).toFixed(2),
                is_buy: false
              })
            }
          })
          this._state.asks.forEach((ask, index) => {
            if (tradeUpdate.order_id === ask.id) {
              ask.volume = LunoUtil.convertSatoshisToDecimalString(LunoUtil.convertStringToSatoshis(ask.volume) - LunoUtil.convertStringToSatoshis(tradeUpdate.base))
              if (ask.volume === "0") {
                this._deleteAskByIndex(index)
              }
              this._state.trades.push({
                volume: tradeUpdate.base,
                timestamp: state.timestamp,
                price: (tradeUpdate.counter / tradeUpdate.base).toFixed(2),
                is_buy: true
              })
            }
          })
        })
      }
      if (state.delete_update) {
        const bidIndex = this._state.bids.findIndex(bid => (bid.id === state.delete_update.order_id))
        if (bidIndex !== -1) {
          this._deleteBidByIndex(bidIndex)
        }
        const askIndex = this._state.asks.findIndex(ask => (ask.id === state.delete_update.order_id))
        if (askIndex !== -1) {
          this._deleteAskByIndex(askIndex)
        }
      }
      this._state.timestamp = state.timestamp
      this._state.sequence = state.sequence
      return true
    } else {
      return false
    }
  } else {
    return this._state
  }
}

module.exports = LunoBook
