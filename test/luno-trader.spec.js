'use strict'

const LunoTrader = require('./../lib/luno-trader')
var https = require('https')
const LunoBook = require('./../lib/luno-book')
var PassThrough = require('stream').PassThrough
const sinon = require('sinon')
var casual = require('casual')
var sandbox = sinon.sandbox.create()
const LunoCurrency = require('./../lib/luno-connector')

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
  
  it('should place a buy order', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)

    // const fromAmount = new LunoCurrency(casual.double(500, 750).toFixed(2), 'ZAR')

    const lunoTrader = new LunoTrader(new LunoBook(), credentials)
    lunoTrader.exchange()
    expect(https.request.calledOnce).to.be.true
    expect(request.write.getCall(0).args).to.deep.equal(["type=BID&volume=0.0005&price=10&pair=XBTZAR"])
  })
  
  it('should place a sell order', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)

    const lunoTrader = new LunoTrader(new LunoBook(), credentials)
    lunoTrader.exchange({from: 'XBT', to: 'ZAR'})
    expect(https.request.calledOnce).to.be.true
    expect(request.write.getCall(0).args).to.deep.equal(["type=ASK&volume=0.0005&price=10&pair=XBTZAR"])
  })
})