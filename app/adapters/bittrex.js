const utils = require('../utils.js');

function getbittrex(pair) {
  return new Promise((resolve, reject) => {
    (async function () {
      var UsdtBtc = await utils.getPrice("bittrex", "https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=usdt-btc");
      var BtcToken = await utils.getPrice("bittrex", "https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=" + pair);

      var price = UsdtBtc.price * BtcToken.price;
      var volume = BtcToken.volume;

      resolve({price: price, volume: volume});
    })();
  });

}

(async function () {
  var res = await getbittrex('btc-hive');
  console.log(res.price, res.volume);
})();





bittrex = {
  "success": true,
  "message": "",
  "result": [
    {
      "MarketName": "BTC-HIVE",
      "High": 4.146e-05,
      "Low": 3e-05,
      "Volume": 149184.86860382,
      "Last": 3.852e-05,
      "BaseVolume": 5.53368531,
      "TimeStamp": "2020-03-25T17:19:45.423",
      "Bid": 3.851e-05,
      "Ask": 3.899e-05,
      "OpenBuyOrders": 121,
      "OpenSellOrders": 185,
      "PrevDay": 3.104e-05,
      "Created": "2020-03-21T20:13:46.243"
    }
  ]
};

binance = {
  "symbol": "STEEMBTC",
  "priceChange": "-0.00000179",
  "priceChangePercent": "-6.724",
  "weightedAvgPrice": "0.00002570",
  "prevClosePrice": "0.00002660",
  "lastPrice": "0.00002483",
  "lastQty": "891.00000000",
  "bidPrice": "0.00002473",
  "bidQty": "963.00000000",
  "askPrice": "0.00002484",
  "askQty": "496.00000000",
  "openPrice": "0.00002662",
  "highPrice": "0.00002748",
  "lowPrice": "0.00002431",
  "volume": "6188980.00000000",
  "quoteVolume": "159.08143095",
  "openTime": 1585073117057,
  "closeTime": 1585159517057,
  "firstId": 6603626,
  "lastId": 6618051,
  "count": 14426
};

huobi = {
  "status": "ok",
  "ch": "market.steemusdt.detail.merged",
  "ts": 1585161311582,
  "tick": {
    "amount": 1720519.762300271,
    "open": 0.2257,
    "close": 0.2212,
    "high": 0.2309,
    "id": 200236915883,
    "count": 4300,
    "low": 0.2192,
    "version": 200236915883,
    "ask": [
      0.2218,
      556.7759
    ],
    "vol": 385204.17940241,
    "bid": [
      0.2206,
      2566.3127
    ]
  }
};

upbit = [
  {
    "market": "BTC-STEEM",
    "trade_date": "20200324",
    "trade_time": "141243",
    "trade_date_kst": "20200324",
    "trade_time_kst": "231243",
    "trade_timestamp": 1585059163000,
    "opening_price": 2.482e-05,
    "high_price": 2.788e-05,
    "low_price": 2.482e-05,
    "trade_price": 2.788e-05,
    "prev_closing_price": 2.788e-05,
    "change": "EVEN",
    "change_price": 0,
    "change_rate": 0,
    "signed_change_price": 0,
    "signed_change_rate": 0,
    "trade_volume": 615.05481851,
    "acc_trade_price": 0.11898017,
    "acc_trade_price_24h": 0.0520698648119709,
    "acc_trade_volume": 4563.62561257,
    "acc_trade_volume_24h": 1867.80379871,
    "highest_52_week_price": 0.0001465,
    "highest_52_week_date": "2019-03-10",
    "lowest_52_week_price": 1.126e-05,
    "lowest_52_week_date": "2019-11-01",
    "timestamp": 1585059163169
  }
];

probit = {
  "data": [
    {
      "last": "0.1642",
      "low": "0.1624",
      "high": "0.1851",
      "change": "-0.0143",
      "base_volume": "131378.8331",
      "quote_volume": "22535.03995398",
      "market_id": "STEEM-USDT",
      "time": "2020-03-25T19:38:20.000Z"
    }
  ]
};

ionomy = {
  "success": true,
  "status": 200,
  "message": null,
  "data": {
    "market": "btc-hive",
    "high": "0.00003960",
    "low": "0.00002900",
    "volume": "19956.99973677",
    "price": "0.00003799",
    "change": "26.63",
    "baseVolume": "0.75816642",
    "bidsOpenOrders": "81",
    "bidsLastPrice": "0.00003337",
    "asksOpenOrders": "51",
    "asksLastPrice": "0.00003799"
  }
};

kraken = {
  "error": [],
  "result": {
    "USDTZUSD": {
      "a": [
        "1.00180000",
        "27181",
        "27181.000"
      ],
      "b": [
        "1.00150000",
        "4992",
        "4992.000"
      ],
      "c": [
        "1.00180000",
        "96.28000000"
      ],
      "v": [
        "2676937.82651697",
        "4001344.53740195"
      ],
      "p": [
        "1.00265932",
        "1.00248254"
      ],
      "t": [
        3682,
        5751
      ],
      "l": [
        "1.00140000",
        "1.00120000"
      ],
      "h": [
        "1.00400000",
        "1.00400000"
      ],
      "o": "1.00330000"
    }
  }
};