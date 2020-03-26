const
  request = require('request'),
  steem = require('steem'),
  config = require('./config.json');

var getAccountInfo = function (account) {
  return new Promise((resolve, reject) => {
    steem.api.getAccounts([account], function (err, response) {
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
    if (steem.auth.wifIsValid(privateKeyFromConfig, publicKeyFromBlockchain)) {
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
  if (config.hivechain)
    rpc = config.hiverpc;
  if (config.steemchain)
    rpc = config.steemrpc;

  var maxrpc = rpc.length;

  if (rpc && counter !== maxrpc) {
    wait(2000);

    steem.api.setOptions({url: rpc[counter], useAppbaseApi: true});
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
      case "bittrex":
        // https://bittrex.github.io/api/v1-1
        url = "https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=" + pair;
        break;
      case "binance":
        // https://binance-docs.github.io/apidocs/spot/en/
        url = "https://api.binance.com/api/v3/ticker/24hr?symbol=" + pair;
        break;
      case "huobi":
        // https://huobiapi.github.io/docs/dm/v1/en/
        url = "https://api.huobi.pro/market/detail/merged?symbol=" + pair;
        break;
      case "poloniex":
        // https://docs.poloniex.com
        url = "https://poloniex.com/public?command=returnTicker";
        break;
      case "upbit":
        // https://docs.upbit.com/v1.0.7/reference
        // https://upbit.com/exchange?code=CRIX.UPBIT.BTC-STEEM
        url = "https://api.upbit.com/v1/ticker?markets=" + pair;
        break;
      case "probit":
        // https://docs-en.probit.com/docs/getting-started
        // https://www.probit.com/app/exchange/STEEM-USDT
        url = "https://api.probit.com/api/exchange/v1/ticker?market_ids=" + pair;
        break;
      case "ionomy":
        // https://ionomyexchangeapi.docs.apiary.io/#reference/public
        url = "https://ionomy.com/api/v1/public/market-summary?market=" + pair;
        break;
      case "kraken":
        // https://www.kraken.com/help/api#get-ticker-info
        url = "https://api.kraken.com/0/public/Ticker?pair=" + pair;
        break;
      default:
      // code block
    }
    request(url, function (error, response, body) {
      //console.log(response);
      if (body) {
        var json = JSON.parse(body);
        if (exchange === "binance")
          resolve({price: parseFloat(json.lastPrice), volume: parseFloat(json.volume)});
        if (exchange === "bittrex")
          resolve({price: parseFloat(json.result[0].Last), volume: parseFloat(json.result[0].Volume)});
        if (exchange === "huobi")
          resolve({price: parseFloat(json.tick.close), volume: parseFloat(json.tick.vol)});
        if (exchange === "kraken")
          resolve({price: parseFloat(json.result.USDTZUSD.c[0]), volume: parseFloat(json.result.USDTZUSD.v[0])});
        if (exchange === "poloniex")
          resolve({price: parseFloat(json[pair].last), volume: parseFloat(json[pair].quoteVolume)}); // using variable in json selector
        if (exchange === "upbit")
          resolve({price: json[0].trade_price, volume: json[0].acc_trade_volume_24h});
        if (exchange === "ionomy")
          resolve({price: parseFloat(json.data.price), volume: parseFloat(json.data.volume)});
        if (exchange === "probit")
          resolve({price: parseFloat(json.data[0].last), volume: parseFloat(json.data[0].base_volume)});
      }
      if (error) {
        console.log(error);
        resolve(0); // set the price to 0 then take care of not calculating it in the price average
      }
    });
  });
}

module.exports = {
  getAccountInfo,
  checkPrivateKey,
  getDate,
  wait,
  switchrpc,
  getPrice
};
