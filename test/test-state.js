'use strict'

module.exports = {
  getInitialMessage: function () {
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
  },

  getCreateUpdate1: function () {
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
  },

  getCreateUpdate2:  function () {
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
  },

  getCreateUpdate3: function () {
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
  },

  getCreateUpdate4: function () {
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
  },

  getCreateUpdate5: function () {
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
  },

  getCreateUpdate6: function () {
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
  },

  getTradeUpdateMessage7: function () {
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
  },

  getDeleteUpdateMessage8: function () {
    return {
      sequence: '24360',
      trade_updates: null,
      create_update: null,
      delete_update: {
        order_id: '3498282'
      },
      timestamp: 1469031998
    }
  },

  getDeleteUpdateMessage9: function () {
    return {
      sequence: '24361',
      trade_updates: null,
      create_update: null,
      delete_update: {
        order_id: '23298344'
      },
      timestamp: 1469031999
    }
  },

  getExpectedInitialState: function () {
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
  },

  getExpectedState9: function () {
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
}