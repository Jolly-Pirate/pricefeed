const
  hive = require("@hiveio/hive-js"),
  config = require("./config.json"),
  request = require("request");

const
  Reset = "\x1b[0m",
  Red = "\x1b[31m";

var getAccountInfo = function (account) {
  return new Promise((resolve, reject) => {
    hive.api.getAccounts([account], function (err, response) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(response);
    });
  });
};

function checkPrivateKey(privateKeyFromConfig, publicKeyFromBlockchain) {
  // Verify the private key in the config vs the public key on the blockchain
  try {
    if (hive.auth.wifIsValid(privateKeyFromConfig, publicKeyFromBlockchain)) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    //console.log(e);
    return false;
  }
}

function getDate() {
  return new Date().toLocaleString();
}

function wait(ms) {
  var d = new Date();
  var d2 = null;
  do {
    d2 = new Date();
  } while (d2 - d < ms);
}

function switchrpc(counter) {
  var rpc = [];
  rpc = config.hiverpc;

  var maxrpc = rpc.length;

  if (rpc && counter !== maxrpc) {
    hive.api.setOptions({ url: rpc[counter], useAppbaseApi: true });
    console.log(getDate(), "Switching to RPC", rpc[counter]);

    //process.stderr.write("\x07");// "\007" beep
  } else {
    console.log(getDate(), "Cycled through and exhausted all RPCs. Exiting.");
    process.exit();
  }
}

function getPrice(exchange, pair) {
  return new Promise((resolve, reject) => {
    var url;
    switch (exchange) {
      case "binance":
        // https://binance-docs.github.io/apidocs/spot/en/
        url = "https://api.binance.com/api/v3/ticker/24hr?symbol=" + pair;
        break;
      case "bittrex":
        // https://bittrex.github.io/api/v3
        url = `https://api.bittrex.com/v3/markets/${pair}/summary`;
        break;
      case "huobi":
        // https://huobiapi.github.io/docs/dm/v1/en/
        url = "https://api.huobi.pro/market/detail/merged?symbol=" + pair;
        break;
      case "ionomy":
        // https://ionomyexchangeapi.docs.apiary.io/#reference/public
        url = "https://ionomy.com/api/v1/public/market-summary?market=" + pair;
        break;
      case "kraken":
        // https://www.kraken.com/help/api#get-ticker-info
        url = "https://api.kraken.com/0/public/Ticker?pair=" + pair;
        break;
      case "poloniex":
        // https://docs.poloniex.com
        url = "https://poloniex.com/public?command=returnTicker";
        break;
      case "probit":
        // https://docs-en.probit.com/docs/getting-started
        // https://www.probit.com/app/exchange/HIVE-USDT
        url = "https://api.probit.com/api/exchange/v1/ticker?market_ids=" + pair;
        break;
      case "upbit":
        // https://docs.upbit.com/v1.0.7/reference
        // https://upbit.com/exchange?code=CRIX.UPBIT.BTC-HIVE
        url = "https://api.upbit.com/v1/ticker?markets=" + pair;
        break;
      case "mexc":
        // https://mexcdevelop.github.io/apidocs/spot_v3_en/#24hr-ticker-price-change-statistics
        url = "https://api.mexc.com/api/v3/ticker/24hr?symbol=" + pair;
        break;
      case "gateio":
        // https://www.gate.io/docs/developers/apiv4/#get-details-of-a-specifc-currency-pair
        url = "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=" + pair;
        break;
      default:
    }
    request(url, function (error, response, body) {
      if (body && body.includes(pair)) {
        var json = JSON.parse(body); // convert body to json
        if (exchange === "binance")
          resolve({ price: parseFloat(json.lastPrice), volume: parseFloat(json.volume) });
        if (exchange === "bittrex")
          resolve({ price: parseFloat(json.high), volume: parseFloat(json.volume) });
        if (exchange === "huobi")
          resolve({ price: parseFloat(json.tick.close), volume: parseFloat(json.tick.vol) });
        if (exchange === "ionomy")
          resolve({ price: parseFloat(json.data.price), volume: parseFloat(json.data.volume) });
        if (exchange === "kraken")
          resolve({ price: parseFloat(json.result.USDTZUSD.c[0]), volume: parseFloat(json.result.USDTZUSD.v[0]) });
        if (exchange === "poloniex")
          resolve({ price: parseFloat(json[pair].last), volume: parseFloat(json[pair].quoteVolume) }); // using variable in json selector
        if (exchange === "probit")
          resolve({ price: parseFloat(json.data[0].last), volume: parseFloat(json.data[0].base_volume) });
        if (exchange === "upbit")
          resolve({ price: json[0].trade_price, volume: json[0].acc_trade_volume_24h });
        if (exchange === "mexc")
          resolve({ price: parseFloat(json.lastPrice), volume: parseFloat(json.volume) });
        if (exchange === "gateio")
          resolve({ price: parseFloat(json[0].last), volume: parseFloat(json[0].base_volume) });
      } else {
        console.log(Red, "Error fetching", pair, "from", exchange, Reset);
        resolve({ price: 0, volume: 0 });
      }
      if (error) {
        console.log(error);
        resolve({ price: 0, volume: 0 }); // set the price/volume to 0 and exclude it in the price calculation
      }
    });
  });
}

module.exports = {
  checkPrivateKey,
  getAccountInfo,
  getDate,
  getPrice,
  switchrpc,
  wait
};
