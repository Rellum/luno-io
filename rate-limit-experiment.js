'use strict'

const debug = require('debug')('rate-limit-experiment')
const BitX = require('bitx')

const api_key_id = 'j9ga4gsrxp3v4'
const api_key_secret = 'mVw8z45FTLq3fOyWVR2noXOgCQk8h9F47iWkKxUOACA'

const bitx = BitX(api_key_id, api_key_secret)

setInterval(function () {
  bitx.getTicker({}, (err, data) => debug(!!err))
}, 10000)
