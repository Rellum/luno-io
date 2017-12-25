'use strict'

const EventEmitter = require('events').EventEmitter

const LunoTrader = require('./../lib/luno-trader')
const LunoOrder = require('./../lib/luno-order')
var https = require('https')
const LunoBook = require('./../lib/luno-book')
var PassThrough = require('stream').PassThrough
const sinon = require('sinon')
var casual = require('casual')
var sandbox = sinon.sandbox.create()
const LunoCurrency = require('./../lib/luno-currency')

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect

const credentials = {
  'api_key_id': '',
  'api_key_secret': ''
}

describe('constructor', function () {
  it('should be a function', function () {
    const actual = new LunoTrader(new LunoBook(), credentials)
    expect(actual).to.be.a('luno-trader')
  })
})

describe('placeOrder', function () {
  beforeEach(function () {
    sandbox.stub(https, 'request')
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should be a function', function () {
    const lunoTrader = new LunoTrader(new LunoBook(), credentials)
    expect(lunoTrader.placeOrder).to.be.a('function')
  })

  it('should send a request', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)

    const lunoTrader = new LunoTrader(new LunoBook(), credentials)
    lunoTrader.placeOrder()
    expect(https.request.calledOnce).to.be.true
    expect(request.write.getCall(0).args).to.deep.equal(["type=BID&volume=0.0005&price=10&pair=XBTZAR"])
  })
  
  it('should use given options', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)

    const type = casual.random_element(['BID', 'ASK'])
    const volume = casual.double(0.0005, 5).toFixed(8)
    const price = casual.integer(10, 520000)

    const lunoTrader = new LunoTrader(new LunoBook(), credentials)
    lunoTrader.placeOrder({price, volume, type})
    expect(https.request.calledOnce).to.be.true
    expect(request.write.getCall(0).args).to.deep.equal(["type=" + type + "&volume=" + volume + "&price=" + price + "&pair=XBTZAR"])
  })
  
  it('should not place a marketable order', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)

    const type = casual.random_element(['BID', 'ASK'])
    const volume = casual.double(0.0005, 5).toFixed(8)
    const price = casual.integer(10, 520000)

    const lunoBook = new LunoBook()
    sinon.stub(lunoBook, 'isOrderMarketable').returns(true)

    const lunoTrader = new LunoTrader(lunoBook, credentials)
    expect(lunoTrader.placeOrder({price, volume, type, notMarketable: true})).to.be.rejected
    expect(lunoBook.isOrderMarketable.called).to.be.true
    expect(https.request.called).to.be.false
  })
})

describe('exchange', function () {
  beforeEach(function () {
    sandbox.stub(https, 'request')
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('should be a function', function () {
    const lunoTrader = new LunoTrader(new LunoBook(), credentials)
    expect(lunoTrader.exchange).to.be.a('function')
  })
  
  it('should place default buy order', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)
    
    const lunoBook = new LunoBook()
    const bestPrice = casual.integer(500, 750)
    sinon.stub(lunoBook, 'getBestPrice').returns(bestPrice)

    const lunoTrader = new LunoTrader(lunoBook, credentials)
    
    lunoTrader.exchange().then(function (data) {
      expect(lunoBook.getBestPrice.callCount).to.equal(1)
      expect(lunoBook.getBestPrice.getCall(0).args).to.deep.equal([{fromCurrency: 'ZAR', toCurrency: 'XBT'}])
      expect(https.request.callCount).to.equal(1)
      expect(request.write.getCall(0).args).to.deep.equal(['type=BID&volume=0.0005&price=' + bestPrice + '&pair=XBTZAR'])
    })
  })
  
  it('should place a buy order', function (done) {
    var request = new PassThrough()
    var response = new EventEmitter()

    sinon.spy(request, 'write')
    https.request.returns(request)

    const lunoBook = new LunoBook()
    const bestPrice = casual.integer(500, 750)
    sinon.stub(lunoBook, 'getBestPrice').returns(bestPrice)
    sinon.stub(lunoBook, 'getOrderAsync').returns(new Promise(function mockPromise (resolve, reject) {
      resolve(new LunoOrder({id: 'vaughan'}))
    }))

    const lunoTrader = new LunoTrader(lunoBook, credentials)

    const fromAmount = new LunoCurrency(casual.double(500, 750).toFixed(2), 'ZAR')
    lunoTrader.exchange({fromAmount}).then(function (data) {
      expect(data).to.equal('order filled')
      expect(lunoBook.getBestPrice.callCount).to.equal(1)
      expect(lunoBook.getBestPrice.getCall(0).args).to.deep.equal([{fromCurrency: 'ZAR', toCurrency: 'XBT'}])
      expect(https.request.callCount).to.equal(1)
      expect(request.write.getCall(0).args).to.deep.equal(['type=BID&volume=' + fromAmount + '&price=' + bestPrice + '&pair=XBTZAR'])
      done()
    })

    response.statusCode = 200
    response.setEncoding = function () {}
    request.emit('response', response)
    response.emit('data', JSON.stringify({order_id: "batman"}))
    response.emit('end')
  })
  
  it('should place a sell order', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)
    
    const lunoBook = new LunoBook()
    const bestPrice = casual.integer(500, 750)
    sinon.stub(lunoBook, 'getBestPrice').returns(bestPrice)

    const lunoTrader = new LunoTrader(lunoBook, credentials)

    const fromAmount = new LunoCurrency(casual.double(0, 2).toFixed(8), 'XBT')
    lunoTrader.exchange({fromAmount}).then(function (data) {
      expect(lunoBook.getBestPrice.callCount).to.equal(1)
      expect(lunoBook.getBestPrice.getCall(0).args).to.deep.equal([{fromCurrency: 'XBT', toCurrency: 'ZAR'}])
      expect(https.request.calledOnce).to.be.true
      expect(request.write.getCall(0).args).to.deep.equal(['type=ASK&volume=' + fromAmount + '&price=' + bestPrice + '&pair=XBTZAR'])
    })
  })
})