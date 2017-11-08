'use strict'

module.exports = {
  convertStringToSatoshis: function (stringAmount) {
    return Math.round(1e8 * stringAmount)
  },

  convertSatoshisToDecimalString: function (satoshis) {
    return parseFloat((satoshis / 1e8).toFixed(4)).toString()
  },

  getMinAsk: function (orderBook) {
    return this.convertSatoshisToDecimalString(orderBook.asks.reduce((min, ask) => {
      return Math.min(min, this.convertStringToSatoshis(ask.price))
    }, Number.POSITIVE_INFINITY))
  },

  getMaxBid: function (orderBook) {
    return this.convertSatoshisToDecimalString(orderBook.bids.reduce((max, bid) => {
      return Math.max(max, this.convertStringToSatoshis(bid.price))
    }, Number.NEGATIVE_INFINITY))
  },

  makeTicker: function (orderBook) {
    if (!orderBook) {
      return undefined
    }
    return {
      ask: this.getMinAsk(orderBook),
      timestamp: orderBook.timestamp,
      bid: this.getMaxBid(orderBook),
      rolling_24_hour_volume: '12.52',
      last_trade: '950.00'
    }
  }
}
