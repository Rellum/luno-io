'use strict'

const expect = require('chai').expect
const LunoUtil = require('./../lib/luno-util')
const sinon = require('sinon')

describe('convertStringToSatoshis', function () {
  it('should be a function', function () {
    expect(LunoUtil.convertStringToSatoshis).to.be.a('function')
  })

  it('should calculate correct value', function () {
    expect(LunoUtil.convertStringToSatoshis('0.0005')).to.equal(50000)

    expect(LunoUtil.convertStringToSatoshis(0.0006)).to.equal(60000)
  })
})

describe('convertStringToSatoshis', function () {
  it('should return correct result', function () {
    const actual = LunoUtil.convertStringToSatoshis('12.52')

    expect(actual).to.equal(1252000000)
  })
})

describe('convertSatoshisToDecimalString', function () {
  it('should be a function', function () {
    expect(LunoUtil.convertSatoshisToDecimalString).to.be.a('function')
  })

  it('should convert correctly', function () {
    expect(LunoUtil.convertSatoshisToDecimalString(102389700)).to.equal('1.023897')
  })
})

describe('convertSatoshisToDecimalString', function () {
  it('should return correct result', function () {
    const actual = LunoUtil.convertSatoshisToDecimalString(1252000000)

    expect(actual).to.equal('12.52')
  })
})
