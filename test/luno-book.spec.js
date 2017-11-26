'use strict'

const expect = require('chai').expect
const LunoBook = require('./../lib/luno-book')
const sinon = require('sinon')

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

    expect(lunoBook.state(getInitialMessage())).to.be.true
    expect(lunoBook.state()).to.deep.equal(getExpectedInitialState())

    expect(lunoBook.state(getCreateUpdate1())).to.be.true
    expect(lunoBook.state(getCreateUpdate2())).to.be.true
    expect(lunoBook.state(getCreateUpdate3())).to.be.true
    expect(lunoBook.state(getCreateUpdate4())).to.be.true
    expect(lunoBook.state(getCreateUpdate5())).to.be.true
    expect(lunoBook.state(getCreateUpdate6())).to.be.true
    expect(lunoBook.state(getTradeUpdateMessage7())).to.be.true
    expect(lunoBook.state(getDeleteUpdateMessage8())).to.be.true

    expect(lunoBook.state(getDeleteUpdateMessage9())).to.be.true
    expect(lunoBook.state()).to.deep.equal(getExpectedState9())
  })

  it('should emit marketChange event', function () {
    const lunoBook = new LunoBook()

    const marketChangeEventSpy = sinon.spy()
    lunoBook.eventEmitter.on('marketChange', marketChangeEventSpy)

    lunoBook.state(getInitialMessage())
    expect(marketChangeEventSpy.callCount).to.equal(1)
    expect(marketChangeEventSpy.withArgs('initialized').callCount).to.equal(1)

    expect(lunoBook.state(getCreateUpdate1())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(2)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(1)

    expect(lunoBook.state(getCreateUpdate2())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(3)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(2)

    expect(lunoBook.state(getCreateUpdate3())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(4)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(3)

    expect(lunoBook.state(getCreateUpdate4())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(5)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(4)

    expect(lunoBook.state(getCreateUpdate5())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(6)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(5)

    expect(lunoBook.state(getCreateUpdate6())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(7)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(6)

    expect(lunoBook.state(getTradeUpdateMessage7())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(8)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(7)

    expect(lunoBook.state(getDeleteUpdateMessage8())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(9)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(8)

    expect(lunoBook.state(getDeleteUpdateMessage9())).to.be.true
    expect(marketChangeEventSpy.callCount).to.equal(10)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(9)
  })

  it('should keep state', function () {
    const lunoBook = new LunoBook()

    expect(lunoBook.state()).to.be.null
    expect(lunoBook.getTicker()).to.be.undefined

    const marketChangeEventSpy = sinon.spy()
    lunoBook.eventEmitter.on('marketChange', marketChangeEventSpy)

    expect(lunoBook.state(getInitialMessage())).to.be.true

    expect(lunoBook.state()).to.deep.equal(getExpectedInitialState())

    expect(marketChangeEventSpy.callCount).to.equal(1)
    expect(marketChangeEventSpy.withArgs('initialized').callCount).to.equal(1)

    expect(lunoBook.getMaxBidPrice).to.be.a('function')
    expect(lunoBook.getMaxBidPrice()).to.equal(1201)

    expect(lunoBook.getMinAskPrice).to.be.a('function')
    expect(lunoBook.getMinAskPrice()).to.equal(1234)

    expect(lunoBook.getTicker).to.be.a('function')
    expect(lunoBook.getTicker()).to.deep.equal({
      ask: 1234,
      timestamp: null,
      bid: 1201,
      rolling_24_hour_volume: '12.52', // not implemented
      last_trade: null
    })

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

    const createUpdateMessage1 = getCreateUpdate1()
    expect(lunoBook.state(createUpdateMessage1)).to.be.true

    expect(marketChangeEventSpy.callCount).to.equal(2)
    expect(marketChangeEventSpy.withArgs('update').callCount).to.equal(1)

    lunoOrder = lunoBook.getOrder('12345678')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(1.23)
    expect(lunoOrder.getPrice()).to.equal(1202.00)
    expect(lunoOrder.getType()).to.equal('BID')
    
    expect(lunoBook.state(getCreateUpdate2())).to.be.true
    expect(lunoBook.state(getCreateUpdate3())).to.be.true

    lunoOrder = lunoBook.getOrder('12345680')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(0.96)
    expect(lunoOrder.getPrice()).to.equal(1234.00)
    expect(lunoOrder.getType()).to.equal('ASK')
    
    expect(lunoBook.state(getCreateUpdate4())).to.be.true
    expect(lunoBook.state(getCreateUpdate5())).to.be.true
    expect(lunoBook.state(getCreateUpdate6())).to.be.true
    expect(lunoBook.state(getTradeUpdateMessage7())).to.be.true

    lunoOrder = lunoBook.getOrder('3498284')
    expect(lunoOrder.getVolume()).to.equal(1.21)
    
    expect(lunoBook.state(getDeleteUpdateMessage8())).to.be.true

    lunoOrder = lunoBook.getOrder('12345684')
    expect(lunoOrder).to.be.a('luno-order')
    expect(lunoOrder.getVolume()).to.equal(4.04)
    expect(lunoOrder.getPrice()).to.equal(1203.00)
    expect(lunoOrder.getType()).to.equal('BID')

    expect(lunoBook.getOrder('3498282')).to.not.be.ok
    
    expect(lunoBook.state(getDeleteUpdateMessage9())).to.be.true

    expect(lunoBook.state()).to.deep.equal(getExpectedState9())

    expect(lunoBook.getMaxBidPrice()).to.equal(1203)
    expect(lunoBook.getMinAskPrice()).to.equal(1233)

    expect(lunoBook.getTicker()).to.deep.equal({
      ask: 1233,
      timestamp: 1469031999,
      bid: 1203,
      rolling_24_hour_volume: '12.52', // not implemented
      last_trade: 1199.00
    })
  })
})

function getInitialMessage () {
  return {
    sequence: '24352',
    asks: [
      {
        id: '23298343',
        price: '1234.00',
        volume: '0.93'
      },
      {
        id: '23298344',
        price: '1237.00',
        volume: '0.94'
      },
      {
        id: '23298345',
        price: '1237.00',
        volume: '0.95'
      }
    ],
    bids: [
      {
        id: '3498282',
        price: '1201.00',
        volume: '1.22'
      },
      {
        id: '3498283',
        price: '1200.00',
        volume: '1.22'
      },
      {
        id: '3498284',
        price: '1199.00',
        volume: '1.22'
      },
      {
        id: '3498285',
        price: '1199.00',
        volume: '1.22'
      }
    ],
    timestamp: null,
    trades: []
  }
}

function getCreateUpdate1 () {
  return {
    sequence: '24353',
    trade_updates: null,
    create_update: {
      order_id: '12345678',
      type: 'BID',
      price: '1202.00',
      volume: '1.23'
    },
    delete_update: null,
    timestamp: 1469031991
  }
}

function getCreateUpdate2 () {
  return {
    sequence: '24354',
    trade_updates: null,
    create_update: {
      order_id: '12345679',
      type: 'BID',
      price: '1200.00',
      volume: '1.24'
    },
    delete_update: null,
    timestamp: 1469031992
  }
}

function getCreateUpdate3 () {
  return {
    sequence: '24355',
    trade_updates: null,
    create_update: {
      order_id: '12345680',
      type: 'ASK',
      price: '1234.00',
      volume: '0.96'
    },
    delete_update: null,
    timestamp: 1469031993
  }
}

function getCreateUpdate4 () {
  return {
    sequence: '24356',
    trade_updates: null,
    create_update: {
      order_id: '12345681',
      type: 'ASK',
      price: '1237.00',
      volume: '0.97'
    },
    delete_update: null,
    timestamp: 1469031994
  }
}

function getCreateUpdate5 () {
  return {
    sequence: '24357',
    trade_updates: null,
    create_update: {
      order_id: '12345682',
      type: 'BID',
      price: '1199.00',
      volume: '0.98'
    },
    delete_update: null,
    timestamp: 1469031995
  }
}

function getCreateUpdate6 () {
    return {
      sequence: '24358',
      trade_updates: null,
      create_update: {
        order_id: '12345683',
        type: 'ASK',
        price: '1233.00',
        volume: '0.99'
      },
      delete_update: null,
      timestamp: 1469031996
    }
}

function getTradeUpdateMessage7 () {
  return {
    sequence: '24359',
      trade_updates: [
    {
      base: '0.01',
      counter: '11.99',
      order_id: '3498284'
    },
    {
      base: '0.1',
      counter: '123.40',
      order_id: '23298343'
    },
    {
      base: '1.22',
      counter: '1464.00',
      order_id: '3498283'
    }
  ],
    create_update: {
    order_id: '12345684',
      type: 'BID',
      price: '1203.00',
      volume: '4.04'
  },
    delete_update: null,
      timestamp: 1469031997
  }
}

function getDeleteUpdateMessage8 () {
  return {
    sequence: '24360',
    trade_updates: null,
    create_update: null,
    delete_update: {
      order_id: '3498282'
    },
    timestamp: 1469031998
  }
}

function getDeleteUpdateMessage9 () {
  return {
    sequence: '24361',
    trade_updates: null,
    create_update: null,
    delete_update: {
      order_id: '23298344'
    },
    timestamp: 1469031999
  }
}

function getExpectedInitialState () {
  return {
    sequence: '24352',
    asks: [
      {
        id: '23298343',
        price: '1234.00',
        volume: '0.93',
        type: 'ASK'
      },
      {
        id: '23298344',
        price: '1237.00',
        volume: '0.94',
        type: 'ASK'
      },
      {
        id: '23298345',
        price: '1237.00',
        volume: '0.95',
        type: 'ASK'
      }
    ],
    bids: [
      {
        id: '3498282',
        price: '1201.00',
        volume: '1.22',
        type: 'BID'
      },
      {
        id: '3498283',
        price: '1200.00',
        volume: '1.22',
        type: 'BID'
      },
      {
        id: '3498284',
        price: '1199.00',
        volume: '1.22',
        type: 'BID'
      },
      {
        id: '3498285',
        price: '1199.00',
        volume: '1.22',
        type: 'BID'
      }
    ],
    timestamp: null,
    trades: []
  }
}

function getExpectedState9 () {
  return {
    asks: [
      {
        id: '12345683',
        price: '1233.00',
        volume: '0.99',
        type: 'ASK'
      },
      {
        id: '12345680',
        price: '1234.00',
        volume: '0.96',
        type: 'ASK'
      },
      {
        id: '23298343',
        price: '1234.00',
        volume: '0.83',
        type: 'ASK'
      },
      {
        id: '12345681',
        price: '1237.00',
        volume: '0.97',
        type: 'ASK'
      },
      {
        id: '23298345',
        price: '1237.00',
        volume: '0.95',
        type: 'ASK'
      }
    ],
    bids: [
      {
        id: '12345684',
        price: '1203.00',
        volume: '4.04',
        type: 'BID'
      },
      {
        id: '12345678',
        price: '1202.00',
        volume: '1.23',
        type: 'BID'
      },
      {
        id: '12345679',
        price: '1200.00',
        volume: '1.24',
        type: 'BID'
      },
      {
        id: '12345682',
        price: '1199.00',
        volume: '0.98',
        type: 'BID'
      },
      {
        id: '3498284',
        price: '1199.00',
        volume: '1.21',
        type: 'BID'
      },
      {
        id: '3498285',
        price: '1199.00',
        volume: '1.22',
        type: 'BID'
      }
    ],
    trades: [
      {
        volume: '0.01',
        timestamp: 1469031997,
        price: '1199.00',
        is_buy: false
      },
      {
        volume: '0.1',
        timestamp: 1469031997,
        price: '1234.00',
        is_buy: true
      },
      {
        volume: '1.22',
        timestamp: 1469031997,
        price: '1200.00',
        is_buy: false
      }
    ],
    sequence: '24361',
    timestamp: 1469031999
  }
}
