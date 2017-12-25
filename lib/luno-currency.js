'use strict'

class LunoCurrency {
  constructor (amount = 0, currency = 'ZAR') {
    this._currency = currency
    this._amount = this._convertToSmallestUnits(amount)
  }

  _getNumberOfDecimals () {
    switch (this._currency) {
      case 'ZAR':
        return 2
      case 'XBT':
        return 8
    }
  }

  _convertToSmallestUnits (amount) {
    return Math.floor(parseFloat(amount) * (Math.pow(10, this._getNumberOfDecimals())))
  }

  _convertToBaseUnits (amount) {
    return amount / Math.pow(10, this._getNumberOfDecimals())
  }

  add (amount) {
    const newAmount = this._convertToSmallestUnits(amount) + this._amount
    return new LunoCurrency(
      this._convertToString(this._convertToBaseUnits(newAmount)),
      this._currency
    )
  }

  get [Symbol.toStringTag] () {
    return 'luno-currency'
  }

  getCurrencyId () {
    return this._currency
  }

  _convertToString (amount) {
    return (amount).toFixed(this._getNumberOfDecimals())
  }

  toString () {
    return this._convertToString(this._convertToBaseUnits(this._amount))
  }
}

module.exports = LunoCurrency

