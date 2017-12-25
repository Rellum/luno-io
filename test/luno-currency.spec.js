'use strict'

const expect = require('chai').expect
const LunoCurrency = require('./../lib/luno-currency')
const sinon = require('sinon')

describe('default', function () {
  it('should be a currency', function () {
    expect(new LunoCurrency()).to.be.a('luno-currency')
  })

  it('should return currency identifier', function () {
    let lunoCurrency = new LunoCurrency(100.00)
    expect(lunoCurrency.getCurrencyId()).to.equal('ZAR')
  })
})
  
describe('Rand', function () {  
  it('should return currency identifier', function () {
    let lunoCurrency = new LunoCurrency(100.00, 'ZAR')
    expect(lunoCurrency.getCurrencyId()).to.equal('ZAR')
  })

  it('should accept string format', function () {
    let lunoCurrency = new LunoCurrency('100.00', 'ZAR')
    expect(lunoCurrency.toString()).to.equal('100.00')
    
    lunoCurrency = new LunoCurrency('0.099', 'ZAR')
    expect(lunoCurrency.toString()).to.equal('0.09')
  })
  
  it('should accept float format', function () {
    let lunoCurrency = new LunoCurrency(100.00, 'ZAR')
    expect(lunoCurrency.toString()).to.equal('100.00')
    
    lunoCurrency = new LunoCurrency(100.099, 'ZAR')
    expect(lunoCurrency.toString()).to.equal('100.09')
  })
  
  it('should accept integer format', function () {
    const lunoCurrency = new LunoCurrency(100, 'ZAR')
    expect(lunoCurrency.toString()).to.equal('100.00')
  })
  
  it('should add correctly', function () {
    let lunoCurrency = new LunoCurrency(0.2, 'ZAR').add('0.3')
    expect(lunoCurrency.toString()).to.equal('0.50')
    
    lunoCurrency = new LunoCurrency(0.005).add('0.005', 'ZAR')
    expect(lunoCurrency.toString()).to.equal('0.00')
    
    lunoCurrency = new LunoCurrency(0.015).add('100.005', 'ZAR')
    expect(lunoCurrency.toString()).to.equal('100.01')
  })
})

describe('Bitcoin', function () {  
  it('should return currency identifier', function () {
    let lunoCurrency = new LunoCurrency(100.00, 'XBT')
    expect(lunoCurrency.getCurrencyId()).to.equal('XBT')
  })
  
  it('should accept string format', function () {
    let lunoCurrency = new LunoCurrency('100.00', 'XBT')
    expect(lunoCurrency.toString()).to.equal('100.00000000')
    
    lunoCurrency = new LunoCurrency('0.099', 'XBT')
    expect(lunoCurrency.toString()).to.equal('0.09900000')
    
    lunoCurrency = new LunoCurrency('0.000000019', 'XBT')
    expect(lunoCurrency.toString()).to.equal('0.00000001')
  })
      
  it('should accept float format', function () {
    let lunoCurrency = new LunoCurrency(100.00, 'XBT')
    expect(lunoCurrency.toString()).to.equal('100.00000000')
    
    lunoCurrency = new LunoCurrency(100.099, 'XBT')
    expect(lunoCurrency.toString()).to.equal('100.09900000')
    
    lunoCurrency = new LunoCurrency(100.000000201, 'XBT')
    expect(lunoCurrency.toString()).to.equal('100.00000020')
  })
  
  it('should accept integer format', function () {
    const lunoCurrency = new LunoCurrency(100, 'XBT')
    expect(lunoCurrency.toString()).to.equal('100.00000000')
  })
  
  it('should add correctly', function () {
    let lunoCurrency = new LunoCurrency(0.2, 'XBT').add(new LunoCurrency(0.3, 'XBT'))
    expect(lunoCurrency.toString()).to.equal('0.50000000')
    
    lunoCurrency = new LunoCurrency(0.005).add('0.005', 'ZAR')
    expect(lunoCurrency.toString()).to.equal('0.00')
    
    lunoCurrency = new LunoCurrency(0.015).add('100.005', 'ZAR')
    expect(lunoCurrency.toString()).to.equal('100.01')
  })
})