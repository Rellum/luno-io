'use strict'

const expect = require('chai').expect
const LunoOrder = require('./../lib/luno-order')
const sinon = require('sinon')

describe('constructor', function () {
  it('should be a function', function () {
    expect(LunoOrder).to.be.a('function')
  })

  it('should return an order', function () {
    const actual = LunoOrder()
    expect(actual).to.be.a('luno-order')
  })

  it('should return a unique order', function () {
    const lunoOrder1 = LunoOrder({
      id: 'megan'
    })
    const lunoOrder2 = LunoOrder({
      id: 'Megan'
    })
    expect(lunoOrder1._id).to.equal('megan')
    expect(lunoOrder2._id).to.equal('Megan')
  })

  it('should store an initial order', function () {
    const lunoOrder = LunoOrder({
      id: '23298345',
      price: '1237.00',
      volume: '0.95'
    })
    expect(lunoOrder.getId()).to.equal('23298345')
    expect(lunoOrder.getPrice()).to.equal(1237.00)
    expect(lunoOrder.getVolume()).to.equal(0.95)
  })

  it('should store a created order', function () {
    const lunoOrder1 = LunoOrder({
      order_id: '23298345',
      price: '1237.00',
      volume: '0.95',
      type: 'BID'
    })
    expect(lunoOrder1.getId()).to.equal('23298345')
    expect(lunoOrder1.getPrice()).to.equal(1237.00)
    expect(lunoOrder1.getVolume()).to.equal(0.95)
    expect(lunoOrder1.getType()).to.equal('BID')

    const lunoOrder2 = LunoOrder({
      order_id: '23298346',
      price: '1237.01',
      volume: '0.85',
      type: 'ASK'
    })
    expect(lunoOrder2.getId()).to.equal('23298346')
    expect(lunoOrder2.getPrice()).to.equal(1237.01)
    expect(lunoOrder2.getVolume()).to.equal(0.85)
    expect(lunoOrder2.getType()).to.equal('ASK')
  })
})

describe('getVolume', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.getVolume).to.be.a('function')
  })

  it('should return volume', function () {
    const actual = LunoOrder({
      'volume': '1.23'
    })
    expect(actual.getVolume()).to.equal(1.23)
  })
})

describe('getId', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.getId).to.be.a('function')
  })

  it('should store id', function () {
    const lunoOrder = LunoOrder({
      id: 'megan'
    })
    expect(lunoOrder.getId()).to.equal('megan')
    lunoOrder.setId('vaughan')
    expect(lunoOrder.getId()).to.equal('vaughan')
  })
})

describe('setId', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.setId).to.be.a('function')
  })
})

describe('isId', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.isId).to.be.a('function')
  })

  it('should return correct value', function () {
    const lunoOrder = LunoOrder({
      id: 'megan'
    })

    expect(lunoOrder.isId('megan')).to.equal(true)
    expect(lunoOrder.isId('Megan')).to.equal(false)
  })
})

describe('setVolume', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.setVolume).to.be.a('function')
  })

  it('should save volume given int', function () {
    const lunoOrder = LunoOrder()
    lunoOrder.setVolume(123458)
    expect(lunoOrder._volume).to.equal(123458)
  })

  it('should save volume given string', function () {
    const lunoOrder = LunoOrder()
    lunoOrder.setVolume('123458')
    expect(lunoOrder._volume).to.equal(123458)
  })

  it('should save volume given float', function () {
    const lunoOrder = LunoOrder()
    lunoOrder.setVolume(123458.001)
    expect(lunoOrder._volume).not.to.equal(123458)
    expect(lunoOrder._volume).to.equal(123458.001)
  })
})

describe('setPrice', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.setPrice).to.be.a('function')
  })

  it('should save price given int', function () {
    const lunoOrder = LunoOrder()
    lunoOrder.setPrice(123458)
    expect(lunoOrder._price).to.equal(123458)
  })

  it('should save price given string', function () {
    const lunoOrder = LunoOrder()
    lunoOrder.setPrice('123458')
    expect(lunoOrder._price).to.equal(123458)
  })

  it('should save price given float', function () {
    const lunoOrder = LunoOrder()
    lunoOrder.setPrice(123458.001)
    expect(lunoOrder._volume).not.to.equal(123458)
    expect(lunoOrder._price).to.equal(123458.001)
  })
})

describe('getPrice', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.getPrice).to.be.a('function')
  })

  it('should return correct value', function () {
    const lunoOrder = LunoOrder({
      price: 123457
    })
    expect(lunoOrder.getPrice()).to.equal(123457)

    lunoOrder.setPrice(123458)
    expect(lunoOrder.getPrice()).to.equal(123458)
  })
})

describe('setType', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.setType).to.be.a('function')
  })

  it('should save value', function () {
    const lunoOrder = LunoOrder({
      type: 'ASK'
    })
    expect(lunoOrder._type).to.equal('ASK')

    lunoOrder.setType('BID')
    expect(lunoOrder._type).to.equal('BID')
  })
})

describe('getType', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.getType).to.be.a('function')
  })

  it('should return value', function () {
    const lunoOrder = LunoOrder({
      type: 'BID'
    })
    expect(lunoOrder.getType()).to.equal('BID')

    lunoOrder.setType('ASK')
    expect(lunoOrder.getType()).to.equal('ASK')
  })
})

describe('reduceVolume', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.reduceVolume).to.be.a('function')
  })

  it('should reduce outstanding volume', function () {
    const lunoOrder = LunoOrder({
      volume: '0.005'
    })
    lunoOrder.reduceVolume('0.001')
    expect(lunoOrder._volume).to.equal(0.004)

    lunoOrder.reduceVolume(0.0029)
    expect(lunoOrder._volume).to.equal(0.0011)
  })
})

describe('processTradeUpdate', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.processTradeUpdate).to.be.a('function')
  })

  it('should reduce outstanding volume', function () {
    const lunoOrder = LunoOrder({
      order_id: '23298343',
      volume: '1.0245'
    })
    let actual = lunoOrder.processTradeUpdate({
      base: '0.000603',
      counter: '123.40', // not implemented yet
      order_id: '23298343'
    })
    expect(actual).to.be.a('luno-order')
    expect(actual._volume).to.equal(1.023897)
    actual = lunoOrder.processTradeUpdate({
      base: 1.023896,
      counter: '123.40', // not implemented yet
      order_id: '23298343'
    })
    expect(actual).to.be.a('luno-order')
    expect(actual._volume).to.equal(0.000001)
    actual = lunoOrder.processTradeUpdate({
      base: 0.000001,
      counter: '123.40', // not implemented yet
      order_id: '23298343'
    })
    expect(actual).to.be.a('luno-order')
    expect(actual._volume).to.equal(0)
    expect(lunoOrder._volume).to.equal(0)
  })

  it('should not reduce outstanding volume if id does not match', function () {
    const lunoOrder = LunoOrder({
      volume: '1.23'
    })
    lunoOrder.processTradeUpdate({
      base: '0.1',
      counter: '123.40', // not implemented yet
      order_id: '23298343'
    })
    expect(lunoOrder._volume).to.equal(1.23)
  })
})

describe('toSimple', function () {
  it('should be a function', function () {
    const actual = LunoOrder()
    expect(actual.toSimple).to.be.a('function')
  })

  it('should return a literal of itself', function () {
    const expected = {
      id: '23298345',
      price: '1237.00',
      volume: '0.95',
      type: 'ASK'
    }

    const lunoOrder = LunoOrder(expected)

    expect(lunoOrder.toSimple()).to.deep.equal(expected)
  })
})

