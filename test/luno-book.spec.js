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

    const initialMessage = {
      sequence: '24352',
      asks: [
        {
          id: '23298345',
          price: '1237.00',
          volume: '0.95'
        },
        {
          id: '23298344',
          price: '1237.00',
          volume: '0.94'
        },
        {
          id: '23298343',
          price: '1234.00',
          volume: '0.93'
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
      ]
    }
    expect(lunoBook.state(initialMessage)).to.be.true

    expect(lunoBook.state()).to.equal(initialMessage)

    const createUpdateMessage1 = {
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
    expect(lunoBook.state(createUpdateMessage1)).to.be.true
    
    const createUpdateMessage2 = {
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
    expect(lunoBook.state(createUpdateMessage2)).to.be.true
    
    const createUpdateMessage3 = {
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
    expect(lunoBook.state(createUpdateMessage3)).to.be.true
    
    const createUpdateMessage4 = {
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
    expect(lunoBook.state(createUpdateMessage4)).to.be.true
    
    const createUpdateMessage5 = {
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
    expect(lunoBook.state(createUpdateMessage5)).to.be.true
    
    const createUpdateMessage6 = {
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
    expect(lunoBook.state(createUpdateMessage6)).to.be.true
    
    const tradeUpdateMessage7 = {
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
    expect(lunoBook.state(tradeUpdateMessage7)).to.be.true
    
    const deleteUpdateMessage8 = {
      sequence: '24360',
      trade_updates: null,
      create_update: null,
      delete_update: {
        order_id: '3498282'
      },
      timestamp: 1469031998
    }
    expect(lunoBook.state(deleteUpdateMessage8)).to.be.true
    
    const deleteUpdateMessage9 = {
      sequence: '24361',
      trade_updates: null,
      create_update: null,
      delete_update: {
        order_id: '23298344'
      },
      timestamp: 1469031999
    }
    expect(lunoBook.state(deleteUpdateMessage9)).to.be.true

    const expected = {
      asks: [
        {
          id: '12345681',
          price: '1237.00',
          volume: '0.97'
        },
        {
          id: '23298345',
          price: '1237.00',
          volume: '0.95'
        },
        {
          id: '12345680',
          price: '1234.00',
          volume: '0.96'
        },
        {
          id: '23298343',
          price: '1234.00',
          volume: '0.83'
        },
        {
          id: '12345683',
          price: '1233.00',
          volume: '0.99'
        }
      ],
      bids: [
        {
          id: '12345684',
          price: '1203.00',
          volume: '4.04'
        },
        {
          id: '12345678',
          price: '1202.00',
          volume: '1.23'
        },
        {
          id: '12345679',
          price: '1200.00',
          volume: '1.24'
        },
        {
          id: '3498284',
          price: '1199.00',
          volume: '1.21'
        },
        {
          id: '3498285',
          price: '1199.00',
          volume: '1.22'
        },
        {
          id: '12345682',
          price: '1199.00',
          volume: '0.98'
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
    expect(lunoBook.state()).to.deep.equal(expected)
  })
})
