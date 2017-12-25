'use strict'

const expect = require('chai').expect
const LunoBook = require('./../lib/luno-book')
const LunoOrder = require('./../lib/luno-order')
const testState = require('./test-state')
const sinon = require('sinon')
var casual = require('casual')

describe('Constructor', function () {
  it('should be a constructor', function () {
    const actual = new LunoBook()

    expect(actual).to.be.an('object')
  })
})

describe('State', function () {
  it('should have a state method', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.state).to.be.a('function')
  })

  it('should keep state', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.state()).to.be.null

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.state()).to.deep.equal(testState.getExpectedInitialState())

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true

    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
    expect(lunoBook.state()).to.deep.equal(testState.getExpectedState9())
  })

  it('should emit marketChange event', function () {
    const lunoBook = new LunoBook()

    const marketChangeEventSpy = sinon.spy()
    lunoBook.eventEmitter.on('marketChange', marketChangeEventSpy)

    lunoBook.state(testState.getInitialMessage())
    expect(marketChangeEventSpy.callCount).to.equal(1)
    expect(marketChangeEventSpy.withArgs('initialized').callCount).to.equal(1)

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(2)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(1)

    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(3)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(2)

    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(4)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(3)

    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(5)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(4)

    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(6)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(5)

    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(7)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(6)

    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(8)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(7)

    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(9)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(8)

    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(10)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(9)
  })
  
  it('should emit orderCreated event', function () {
    const lunoBook = new LunoBook()

    const orderCreatedEventSpy = sinon.spy()
    lunoBook.eventEmitter.on('orderCreated', orderCreatedEventSpy)

    lunoBook.state(testState.getInitialMessage())
    expect(orderCreatedEventSpy.callCount).to.equal(0)

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(orderCreatedEventSpy.callCount).to.equal(1)
    expect(orderCreatedEventSpy.args[0][0]).to.be.a('luno-order')
    expect(orderCreatedEventSpy.args[0][0].getId()).to.equal('12345678')

    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(orderCreatedEventSpy.callCount).to.equal(2)
    expect(orderCreatedEventSpy.args[1][0].getId()).to.equal('12345679')

    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(orderCreatedEventSpy.callCount).to.equal(3)
    expect(orderCreatedEventSpy.args[2][0].getId()).to.equal('12345680')

    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(orderCreatedEventSpy.callCount).to.equal(4)
    expect(orderCreatedEventSpy.args[3][0].getId()).to.equal('12345681')

    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(orderCreatedEventSpy.callCount).to.equal(5)
    expect(orderCreatedEventSpy.args[4][0].getId()).to.equal('12345682')

    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(orderCreatedEventSpy.callCount).to.equal(6)
    expect(orderCreatedEventSpy.args[5][0].getId()).to.equal('12345683')

    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
  })

  it('should return specific orders', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true

    expect(lunoBook.getOrder).to.be.a('function')

    let lunoOrder = lunoBook.getOrder('3498282')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(1.22)
    expect(lunoOrder.getPrice()).to.equal(1201.00)
    expect(lunoOrder.getType()).to.equal('BID')

    lunoOrder = lunoBook.getOrder('23298344')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(0.94)
    expect(lunoOrder.getPrice()).to.equal(1237.00)
    expect(lunoOrder.getType()).to.equal('ASK')

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true

    lunoOrder = lunoBook.getOrder('12345678')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(1.23)
    expect(lunoOrder.getPrice()).to.equal(1202.00)
    expect(lunoOrder.getType()).to.equal('BID')

    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true

    lunoOrder = lunoBook.getOrder('12345680')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(0.96)
    expect(lunoOrder.getPrice()).to.equal(1234.00)
    expect(lunoOrder.getType()).to.equal('ASK')

    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true

    lunoOrder = lunoBook.getOrder('3498284')
    expect(lunoOrder.getVolume()).to.equal(1.21)

    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true

    lunoOrder = lunoBook.getOrder('12345684')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(4.04)
    expect(lunoOrder.getPrice()).to.equal(1203.00)
    expect(lunoOrder.getType()).to.equal('BID')

    expect(lunoBook.getOrder('3498282')).to.not.be.ok

    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
  })
})

describe('getTicker', function () {
  it('should calculate ticker data', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getTicker).to.be.a('function')
    expect(lunoBook.getTicker()).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.getTicker()).to.deep.equal({
      ask: 1234,
      timestamp: null,
      bid: 1201,
      rolling_24_hour_volume: null,
      last_trade: null
    })

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true

    expect(lunoBook.getTicker()).to.deep.equal({
      ask: 1233,
      timestamp: 1469031999,
      bid: 1203,
      rolling_24_hour_volume: '1.330',
      last_trade: 1200.00
    })
  })

  it('should exclude orders', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getTicker).to.be.a('function')
    expect(lunoBook.getTicker()).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    const options = {
      exclude: [
        '23298343'
      ]
    }
    expect(lunoBook.getTicker(options)).to.deep.equal({
      ask: 1237,
      timestamp: null,
      bid: 1201,
      rolling_24_hour_volume: null,
      last_trade: null
    })

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true

    options.exclude = [
      '12345683',
      '12345680',
      '12345684',
      '12345678',
      '12345679'
    ]
    expect(lunoBook.getTicker(options)).to.deep.equal({
      ask: 1234,
      timestamp: 1469031999,
      bid: 1199,
      rolling_24_hour_volume: '1.330', // not implemented
      last_trade: 1200.00
    })
  })
})

describe('getMinAskPrice', function () {
  it('should calculate min ask price', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getMinAskPrice).to.be.a('function')
    expect(lunoBook.getMinAskPrice()).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1234)

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1234)

    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1234)

    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1234)

    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1234)

    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1234)

    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1233)

    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1233)

    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1233)

    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
    expect(lunoBook.getMinAskPrice()).to.equal(1233)
  })

  it('should exclude specific orders', function () {
    const lunoBook = new LunoBook()

    let options = {
      exclude: [
        '23298343'
      ]
    }

    expect(lunoBook.getMinAskPrice(options)).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.getMinAskPrice(options)).to.equal(1237)

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true

    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    options.exclude = [
      '12345683'
    ]
    expect(lunoBook.getMinAskPrice(options)).to.equal(1234)

    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
    options.exclude = [
      '12345683',
      '12345680',
      '23298343'
    ]
    expect(lunoBook.getMinAskPrice(options)).to.equal(1237)
  })
})

describe('Sequence check', function () {
  it('should reset if sequence is wrong', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.isLive()).to.be.false
    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.isLive()).to.be.true

    expect(lunoBook.getTicker()).to.not.be.undefined

    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.false
    expect(lunoBook.isLive()).to.be.false

    expect(lunoBook.getTicker()).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.isLive()).to.be.true
  })
})

describe('getDeletedOrders', function () {
  it('should return list of deleted orders', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getDeletedOrders).to.be.a('function')
    expect(lunoBook.getDeletedOrders()).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.getDeletedOrders()).to.deep.equal([])

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.getDeletedOrders()).to.deep.equal(['3498283', '3498282'])
    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
    expect(lunoBook.getDeletedOrders()).to.deep.equal(['3498283', '3498282', '23298344'])
  })
})

describe('isLive', function () {
  it('should have an isLive method', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.isLive).to.be.a('function')
    expect(lunoBook.isLive()).to.be.false
    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.isLive()).to.be.true
  })
})

describe('isOrderMarketable', function () {
  it('should have an isOrderMarketable method', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.isOrderMarketable).to.be.a('function')
  })
  
  it('should return false if volume is too high', function () {
    const lunoBook = new LunoBook()
    
    lunoBook.state(testState.getInitialMessage())
    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'ASK', price: 1201, volume: 0}))).to.be.true
    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'ASK', price: 1201, volume: 1.22}))).to.be.true
    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'ASK', price: 1201, volume: 1.23}))).to.be.false
    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'ASK', price: 1202}))).to.be.false

    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'BID', price: 1234, volume: 0}))).to.be.true
    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'BID', price: 1234, volume: 0.93}))).to.be.true
    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'BID', price: 1234, volume: 0.94}))).to.be.false
    expect(lunoBook.isOrderMarketable(new LunoOrder({type: 'BID', price: 1233}))).to.be.false

    lunoBook.state(testState.getCreateUpdate1())
    lunoBook.state(testState.getCreateUpdate2())
    lunoBook.state(testState.getCreateUpdate3())
    lunoBook.state(testState.getCreateUpdate4())
    lunoBook.state(testState.getCreateUpdate5())
    lunoBook.state(testState.getCreateUpdate6())
    lunoBook.state(testState.getTradeUpdateMessage7())
    lunoBook.state(testState.getDeleteUpdateMessage8())
    lunoBook.state(testState.getDeleteUpdateMessage9())
  })
})

describe('getBidDepth', function () {
  it('should have a getBidDepth method', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getBidDepth).to.be.a('function')
  })

  it('should return depth', function () {
    const lunoBook = new LunoBook()
    
    expect(lunoBook.getBidDepth()).to.be.undefined
    expect(lunoBook.getBidDepth({price: 1200})).to.be.undefined

    lunoBook.state(testState.getInitialMessage())
    expect(lunoBook.getBidDepth({})).to.be.undefined
    expect(lunoBook.getBidDepth({price: Number.POSITIVE_INFINITY})).to.equal(0)
    expect(lunoBook.getBidDepth({price: 1200})).to.equal(2.44)
    expect(lunoBook.getBidDepth({price: Number.NEGATIVE_INFINITY})).to.equal(4.88)
    expect(lunoBook.getBidDepth({price: Number.NEGATIVE_INFINITY, exclude: [casual.random_element(['3498282', '3498283', '3498284', '3498285'])]})).to.equal(3.66)
    expect(lunoBook.getBidDepth({price: Number.NEGATIVE_INFINITY, exclude: ['3498282', '3498283', '7498284', '7498285']})).to.equal(2.44)
  })
})

describe('getAskDepth', function () {
  it('should have a getAskDepth method', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getAskDepth).to.be.a('function')
  })

  it('should return depth', function () {
    const lunoBook = new LunoBook()
    
    expect(lunoBook.getAskDepth()).to.be.undefined
    expect(lunoBook.getAskDepth({price: 1234})).to.be.undefined

    lunoBook.state(testState.getInitialMessage())
    expect(lunoBook.getAskDepth({})).to.be.undefined
    expect(lunoBook.getAskDepth({price: Number.NEGATIVE_INFINITY})).to.equal(0)
    expect(lunoBook.getAskDepth({price: 1234})).to.equal(0.93)
    expect(lunoBook.getAskDepth({price: Number.POSITIVE_INFINITY})).to.equal(2.82)
    expect(lunoBook.getAskDepth({price: Number.POSITIVE_INFINITY, exclude: ['23298344']})).to.equal(1.88)
    expect(lunoBook.getAskDepth({price: Number.POSITIVE_INFINITY, exclude: ['3498282', '3498283', '7498284', '7498285']})).to.equal(2.82)
  })
})

describe('flush', function () {
  it('should have a flush method', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.flush).to.be.a('function')
    expect(lunoBook.flush()).to.be.false
    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.flush()).to.be.true

    expect(lunoBook.getTicker()).to.be.undefined
  })

  it('should return list of deleted orders', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getDeletedOrders).to.be.a('function')
    expect(lunoBook.getDeletedOrders()).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.getDeletedOrders()).to.deep.equal([])

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true
    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.getDeletedOrders()).to.deep.equal(['3498283', '3498282'])
    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
    expect(lunoBook.getDeletedOrders()).to.deep.equal(['3498283', '3498282', '23298344'])
  })
})

describe('getBidAskDirection', function () {
  it('should have a getBidAskDirection method', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.getBidAskDirection).to.be.a('function')
    expect(lunoBook.getBidAskDirection()).to.be.null
    expect(lunoBook.getBidAskDirection()).to.not.be.undefined
    expect(lunoBook.getBidAskDirection({fromCurrency: 'ZAR', toCurrency: 'XBT'})).to.equal('BID')
    expect(lunoBook.getBidAskDirection({fromCurrency: 'XBT', toCurrency: 'ZAR'})).to.equal('ASK')
    expect(lunoBook.getBidAskDirection({fromCurrency: 'XBT1', toCurrency: 'ZAR'})).to.be.undefined
    expect(lunoBook.getBidAskDirection({fromCurrency: 'XBT1', toCurrency: 'ZAR'})).to.not.be.null
    expect(lunoBook.getBidAskDirection({fromCurrency: 'XBT', toCurrency: 'ZAR1'})).to.be.undefined
    expect(lunoBook.getBidAskDirection({fromCurrency: 'XBT', toCurrency: 'ZAR1'})).to.not.be.null
  })
})

describe('getBestPrice', function () {
  it('should have a getBestPrice method', function () {
    const lunoBook = new LunoBook()

    function checkPrices (bid, mid, ask) {
      expect(lunoBook.getBestPrice({toCurrency: 'XBT', fromCurrency: 'ZAR'})).to.equal(bid)
      expect(lunoBook.getBestPrice()).to.equal(mid)
      expect(lunoBook.getBestPrice({toCurrency: 'ZAR', fromCurrency: 'XBT'})).to.equal(ask)
    }

    expect(lunoBook.getBestPrice).to.be.a('function')
    expect(lunoBook.getBestPrice()).to.be.undefined

    lunoBook.state(testState.getInitialMessage())
    checkPrices(1201, 1217.5, 1234)

    lunoBook.state(testState.getCreateUpdate1())
    checkPrices(1202, 1218, 1234)

    lunoBook.state(testState.getCreateUpdate2())
    checkPrices(1202, 1218, 1234)

    lunoBook.state(testState.getCreateUpdate3())
    checkPrices(1202, 1218, 1234)

    lunoBook.state(testState.getCreateUpdate4())
    checkPrices(1202, 1218, 1234)

    lunoBook.state(testState.getCreateUpdate5())
    checkPrices(1202, 1218, 1234)

    lunoBook.state(testState.getCreateUpdate6())
    checkPrices(1202, 1217.5, 1233)

    lunoBook.state(testState.getTradeUpdateMessage7())
    checkPrices(1203, 1218, 1233)

    lunoBook.state(testState.getDeleteUpdateMessage8())
    checkPrices(1203, 1218, 1233)

    lunoBook.state(testState.getDeleteUpdateMessage9())
    checkPrices(1203, 1218, 1233)
    
    expect(lunoBook.getBestPrice({toCurrency: 'ZAR1', fromCurrency: 'XBT'})).to.be.undefined
    expect(lunoBook.getBestPrice({toCurrency: '1ZAR', fromCurrency: 'XBT'})).to.be.undefined
    expect(lunoBook.getBestPrice({toCurrency: 'ZAR', fromCurrency: 'XBT1'})).to.be.undefined
    expect(lunoBook.getBestPrice({toCurrency: 'ZAR', fromCurrency: '1XBT'})).to.be.undefined
  })

  it('should exclude specific orders', function () {
    const lunoBook = new LunoBook()

    const options = {
      fromCurrency: 'ZAR',
      toCurrency: 'XBT',
      exclude: [
        '3498282',
        '3498283'
      ]
    }

    expect(lunoBook.getBestPrice(options)).to.be.undefined

    expect(lunoBook.state(testState.getInitialMessage())).to.be.true
    expect(lunoBook.getBestPrice(options)).to.equal(1199)

    expect(lunoBook.state(testState.getCreateUpdate1())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate2())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate3())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate4())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate5())).to.be.true
    expect(lunoBook.state(testState.getCreateUpdate6())).to.be.true

    expect(lunoBook.state(testState.getTradeUpdateMessage7())).to.be.true
    options.exclude = [
      '12345684'
    ]
    expect(lunoBook.getBestPrice(options)).to.equal(1202)
    expect(lunoBook.state(testState.getDeleteUpdateMessage8())).to.be.true
    expect(lunoBook.state(testState.getDeleteUpdateMessage9())).to.be.true
    options.exclude = [
      '12345684'
    ]
    expect(lunoBook.getBestPrice(options)).to.equal(1202)
  })
})
