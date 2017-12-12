'use strict'

const expect = require('chai').expect
const LunoTrader = require('./../lib/luno-trader')
var https = require('https')
var PassThrough = require('stream').PassThrough
const sinon = require('sinon')
var casual = require('casual')
var sandbox = sinon.sandbox.create()

describe('constructor', function () {
  it('should be a function', function () {
    const actual = new LunoTrader()
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
    const lunoTrader = new LunoTrader()
    expect(lunoTrader.placeOrder).to.be.a('function')
  })

  it('should send a request', function () {
    var request = new PassThrough()
    sinon.spy(request, 'write')
    https.request.returns(request)

    const lunoTrader = new LunoTrader()
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

    const lunoTrader = new LunoTrader()
    lunoTrader.placeOrder({price, volume, type})
    expect(https.request.calledOnce).to.be.true
    expect(request.write.getCall(0).args).to.deep.equal(["type=" + type + "&volume=" + volume + "&price=" + price + "&pair=XBTZAR"])
  })
})
