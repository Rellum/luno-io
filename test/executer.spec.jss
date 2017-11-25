'use strict'

const expect = require('chai').expect
const sinon = require('sinon')
const sinonTestFactory = require('sinon-test')
const sinonTest = sinonTestFactory(sinon)

const Executer = require('./../lib/executer')
const BitX = require('BitX')

describe('executer', () => {
  describe('constructor', () => {
    it('should export a function', () => {
      expect(Executer).to.be.a('function')
    })

    it('should export a constructor', () => {
      const executerInstance = new Executer()
      expect(executerInstance).to.be.an('object')
    })
  })

  describe('buyOrder method', () => {
    it('should not place a buy order that is marketable', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const isBuyMarketableStub = sinon.stub(executerInstance, 'isBuyMarketable')
      isBuyMarketableStub.onCall(0).callsArgWith(1, null, true)

      const postBuyLimitOrderStub = sinon.stub(bitx, 'postBuyOrder')
      const spy = sinon.spy()

      executerInstance.buyOrder('50000', spy)

      expect(spy.calledOnce).to.be.true
      expect(isBuyMarketableStub.calledOnce).to.be.true
      expect(postBuyLimitOrderStub.notCalled).to.be.true
    }))
    
    it('should place a buy order that isn\'t marketable', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const isBuyMarketableStub = sinon.stub(executerInstance, 'isBuyMarketable')
      isBuyMarketableStub.onCall(0).callsArgWith(1, null, false)

      const postBuyLimitOrderStub = sinon.stub(bitx, 'postBuyOrder')
      const spy = sinon.spy()

      executerInstance.buyOrder('50000', spy)

      expect(spy.calledOnce).to.be.true
      expect(isBuyMarketableStub.calledOnce).to.be.true
      expect(postBuyLimitOrderStub.calledOnce).to.be.true
      expect(postBuyLimitOrderStub.calledWithExactly('0.0005', '50000', sinon.match.func)).to.be.true
    }))
    
    it('should default to best price', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const getBestBuyPriceStub = sinon.stub(executerInstance, 'getBestBuyPrice')
      getBestBuyPriceStub.onCall(0).callsArgWith(0, null, '1234')

      const postBuyLimitOrderStub = sinon.stub(bitx, 'postBuyOrder')
      postBuyLimitOrderStub.onCall(0).callsArgWith(2, null, null)

      const spy = sinon.spy()

      executerInstance.buyOrder(null, spy)

      expect(spy.calledOnce).to.be.true
      expect(getBestBuyPriceStub.calledOnce).to.be.true
      expect(postBuyLimitOrderStub.calledOnce).to.be.true
      expect(postBuyLimitOrderStub.calledWithExactly('0.0005', '1234', sinon.match.func)).to.be.true
    }))
  })

  describe('sellOrder method', () => {
    it('should not place a sell order that is marketable', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const isSellMarketableStub = sinon.stub(executerInstance, 'isSellMarketable')
      isSellMarketableStub.onCall(0).callsArgWith(1, null, true)

      const postSellLimitOrderStub = sinon.stub(bitx, 'postSellOrder')
      const spy = sinon.spy()

      executerInstance.sellOrder('50000', spy)

      expect(spy.calledOnce).to.be.true
      expect(isSellMarketableStub.calledOnce).to.be.true
      expect(postSellLimitOrderStub.notCalled).to.be.true
    }))
    
    it('should place a sell order that isn\'t marketable', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const isSellMarketableStub = sinon.stub(executerInstance, 'isSellMarketable')
      isSellMarketableStub.onCall(0).callsArgWith(1, null, false)

      const postSellLimitOrderStub = sinon.stub(bitx, 'postSellOrder')
      const spy = sinon.spy()

      executerInstance.sellOrder('50000', spy)

      expect(spy.calledOnce).to.be.true
      expect(isSellMarketableStub.calledOnce).to.be.true
      expect(postSellLimitOrderStub.calledOnce).to.be.true
      expect(postSellLimitOrderStub.calledWithExactly('0.0005', '50000', sinon.match.func)).to.be.true
    }))
    
    it('should default to best price', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const getBestSellPrice = sinon.stub(executerInstance, 'getBestSellPrice')
      getBestSellPrice.onCall(0).callsArgWith(0, null, '1234')

      const postSellLimitOrderStub = sinon.stub(bitx, 'postSellOrder')
      postSellLimitOrderStub.onCall(0).callsArgWith(2, null, null)

      const spy = sinon.spy()

      executerInstance.sellOrder(null, spy)

      expect(spy.calledOnce).to.be.true
      expect(getBestSellPrice.calledOnce).to.be.true
      expect(postSellLimitOrderStub.calledOnce).to.be.true
      expect(postSellLimitOrderStub.calledWithExactly('0.0005', '1234', sinon.match.func)).to.be.true
    }))
  })

  describe('isBuyMarketable method', () => {
    it('should return true if buy order can be executed', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '1050.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.isBuyMarketable('1050', spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, true)).to.be.true
    }))

    it('should return false if buy order can\'t be executed', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '1050.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.isBuyMarketable('1049', spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, false)).to.be.true
    }))
  })

  describe('isSellMarketable method', () => {
    it('should return true if sell order can be executed', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '1050.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.isSellMarketable('924', spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, true)).to.be.true
    }))

    it('should return false if sell order can\'t be executed', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '1050.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.isSellMarketable('925', spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, false)).to.be.true
    }))
  })
  
  describe('getBestBuyPrice method', () => {
    it('should have a getBestBuyPrice method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.getBestBuyPrice).to.be.a('function')
    })

    it('should return highest bid plus one', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '1050.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.getBestBuyPrice(spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, '925.00')).to.be.true
    }))

    it('should return highest bid if ask is adjacent', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '925.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.getBestBuyPrice(spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, '924.00')).to.be.true
    }))
  })
  
  describe('getBestSellPrice method', () => {
    it('should have a getBestSellPrice method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.getBestSellPrice).to.be.a('function')
    })

    it('should return lowest ask minus one', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '1050.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.getBestSellPrice(spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, '1049.00')).to.be.true
    }))

    it('should return lowest ask if bid is adjacent', sinonTest(() => {
      const bitx = BitX()
      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '925.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)
      const executerInstance = new Executer(bitx)

      const spy = sinon.spy()
      executerInstance.getBestSellPrice(spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, '925.00')).to.be.true
    }))
  })

  describe('getTicker method', () => {
    it('should have a getTicker method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.getTicker).to.be.a('function')
    })

    it('should fetch the ticker from the API', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '925.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.onCall(0).callsArgWith(0, null, ticker)

      const spy = sinon.spy()
      executerInstance.getTicker(spy)

      expect(getTickerStub.calledOnce).to.be.true
      expect(getTickerStub.calledWithExactly(sinon.match.func)).to.be.true
      expect(spy.calledOnce).to.be.true
      expect(spy.calledWithExactly(null, ticker)).to.be.true
    }))

    it('shouldn\'t run concurrent requests', sinonTest(() => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)

      const getTickerStub = sinon.stub(bitx, 'getTicker')
      const ticker = {
        'ask': '925.00',
        'timestamp': 1366224386716,
        'bid': '924.00',
        'rolling_24_hour_volume': '12.52',
        'last_trade': '950.00'
      }
      getTickerStub.callsArgWith(0, null, ticker)

      const clock = sinon.useFakeTimers(Date.now())

      executerInstance.getTicker((err, data) => {
        expect(err).to.be.null
        expect(data).to.equal(ticker)
        clock.tick(249)
        executerInstance.getTicker((err, data) => {
          expect(err).to.be.null
          expect(data).to.equal(ticker)
          clock.tick(2)
          executerInstance.getTicker((err, data) => {
            expect(err).to.be.null
            expect(data).to.equal(ticker)
          })
        })
      })

      expect(getTickerStub.callCount).to.equal(2)
    }))
  })
  
  describe('makeBuyPosition method', () => {
    it('should have a makeBuyPosition method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.makeBuyPosition).to.be.a('function')
    })
  })
  
  describe('makeSellPosition method', () => {
    it('should have a makeSellPosition method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.makeSellPosition).to.be.a('function')
    })
  })
  
  describe('placeOrder method', () => {
    it('should have a placeOrder method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.placeOrder).to.be.a('function')
    })
  })
  
  describe('updatePositions method', () => {
    it('should have an updatePositions method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.updatePositions).to.be.a('function')
    })

    it('should place an order for each new position', () => {
      const bitx = BitX()
      const executerInstance = new Executer(bitx)
      
      const positions = [
        {type: 'ASK', volume: '0.0006', price: '80000'},
        {type: 'ASK', volume: '0.0006', price: '70000'},
        {type: 'BID', volume: '0.0007', price: '60000'},
        {type: 'BID', volume: '0.0008', price: '50000'}
      ]

      const getMyOpenOrdersStub = sinon.stub(executerInstance, 'getMyOpenOrders')
      getMyOpenOrdersStub.callsArgWith(0, null, {
        orders:
        [ { order_id: 'BXPSSJKV5XDSKT',
            creation_timestamp: 1509804078805,
            expiration_timestamp: 0,
            completed_timestamp: 0,
            type: 'ASK',
            state: 'PENDING',
            limit_price: '80000.00',
            limit_volume: '0.0005',
            base: '0.00',
            counter: '0.00',
            fee_base: '0.00',
            fee_counter: '0.00',
            pair: 'XBTZAR',
            btc: '0.00',
            zar: '0.00',
            fee_btc: '0.00',
            fee_zar: '0.00' },
          { order_id: 'BXPSSJKV5XDSKF',
            creation_timestamp: 1509804078806,
            expiration_timestamp: 0,
            completed_timestamp: 0,
            type: 'ASK',
            state: 'PENDING',
            limit_price: '80000.00',
            limit_volume: '0.0002',
            base: '0.00',
            counter: '0.00',
            fee_base: '0.00',
            fee_counter: '0.00',
            pair: 'XBTZAR',
            btc: '0.00',
            zar: '0.00',
            fee_btc: '0.00',
            fee_zar: '0.00' },
          { order_id: 'BXPSSJKV5XDSKG',
            creation_timestamp: 1509804078807,
            expiration_timestamp: 0,
            completed_timestamp: 0,
            type: 'ASK',
            state: 'PENDING',
            limit_price: '80000.00',
            limit_volume: '0.0001',
            base: '0.00',
            counter: '0.00',
            fee_base: '0.00',
            fee_counter: '0.00',
            pair: 'XBTZAR',
            btc: '0.00',
            zar: '0.00',
            fee_btc: '0.00',
            fee_zar: '0.00' },
          { order_id: 'BXCDUV6M2Z4UNZH',
            creation_timestamp: 1509804077689,
            expiration_timestamp: 0,
            completed_timestamp: 0,
            type: 'BID',
            state: 'PENDING',
            limit_price: '114601.00',
            limit_volume: '0.0005',
            base: '0.00',
            counter: '0.00',
            fee_base: '0.00',
            fee_counter: '0.00',
            pair: 'XBTZAR',
            btc: '0.00',
            zar: '0.00',
            fee_btc: '0.00',
            fee_zar: '0.00' },
          { order_id: 'BXDM7ADKS9A4XG6',
            creation_timestamp: 1509804029630,
            expiration_timestamp: 0,
            completed_timestamp: 0,
            type: 'BID',
            state: 'PENDING',
            limit_price: '60000.00',
            limit_volume: '0.0005',
            base: '0.00',
            counter: '0.00',
            fee_base: '0.00',
            fee_counter: '0.00',
            pair: 'XBTZAR',
            btc: '0.00',
            zar: '0.00',
            fee_btc: '0.00',
            fee_zar: '0.00' } ] })

      const placeOrderStub = sinon.stub(executerInstance, 'placeOrder')
      const stopOrderStub = sinon.stub(bitx, 'stopOrder')

      executerInstance.updatePositions(positions)

      expect(getMyOpenOrdersStub.callCount).to.equal(1)
      expect(placeOrderStub.callCount).to.equal(4)
      expect(placeOrderStub.calledWithExactly({type: 'ASK', volume: '0.0001', price: '80000'}, sinon.match.func)).to.be.true
      expect(placeOrderStub.calledWithExactly({type: 'ASK', volume: '0.0006', price: '70000'}, sinon.match.func)).to.be.true
      expect(placeOrderStub.calledWithExactly({type: 'BID', volume: '0.0002', price: '60000'}, sinon.match.func)).to.be.true
      expect(placeOrderStub.calledWithExactly({type: 'BID', volume: '0.0008', price: '50000'}, sinon.match.func)).to.be.true
      
      expect(stopOrderStub.callCount).to.equal(3)
      expect(stopOrderStub.calledWithExactly('BXPSSJKV5XDSKF', sinon.match.func)).to.be.true
      expect(stopOrderStub.calledWithExactly('BXPSSJKV5XDSKG', sinon.match.func)).to.be.true
      expect(stopOrderStub.calledWithExactly('BXCDUV6M2Z4UNZH', sinon.match.func)).to.be.true
    })
  })
  
  describe('getMyOpenOrders method', () => {
    it('should have a getMyOpenOrders method', () => {
      const executerInstance = new Executer()
      expect(executerInstance.getMyOpenOrders).to.be.a('function')
    })
  })
  
  describe('calculations', () => {
    it('should convert satoshis to decimal bitcoin string', () => {      
      function convertStringToSatoshis (stringAmount) {
        return Math.round(1e8 * stringAmount)
      }
      function convertSatoshisToDecimalString (satoshis) {
        return (satoshis/1e8).toFixed(4)
      }
      expect(convertSatoshisToDecimalString(convertStringToSatoshis('0.0005'))).to.equal('0.0005')
    })
  })
})
