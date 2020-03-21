const
  Reset = "\x1b[0m",
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  request = require('request'),
  steem = require('steem'),
  config = require('./config.json'),
  utils = require('./utils.js');

if (config.steemchain && config.hivechain) {
  console.log('Enable only one blockchain in the app/config.json file, hivechain or steemchain, then restart');
  console.log('Exiting');
  process.exit();
}

var counter = 0;
utils.switchrpc(counter);

checkAccount = function () {
  return new Promise((resolve, reject) => {
    steem.api.getAccountsAsync([config.witness])
      .then(function (result) {
        if (result[0]) {
          var publicKeyFromBlockchain = result[0].active.key_auths[0][0];
          if (!utils.checkPrivateKey(config.privateActiveKey, publicKeyFromBlockchain)) {
            console.log(Yellow + "Must use a valid Active Key. Exiting." + Reset);
            process.exit();
          } else {
            console.log(utils.getDate(), "Witness", Green + config.witness + Reset, "successfully checked out.");
            resolve(true);
          }
        } else {
          console.log(utils.getDate(), Yellow + "Witness doesn't exit. Exiting." + Reset);
          process.exit();
        }
      })
      .catch(function (err) {
        console.log(utils.getDate(), Red, "Error in getAccountsAsync()", err, Reset);
        if (JSON.stringify(err, null, 1).includes("RPCError: Unable to acquire database lock")) { // particular to api.steemit.com
          utils.wait(5000);
          counter = 0;
          checkAccount();
        } else {
          utils.switchrpc(counter);
          counter++;
          checkAccount();
        }
      });
  });
};

getPrice = function (exchange, ticker_url) {
  return new Promise((resolve, reject) => {
    request(ticker_url, function (error, response, body) {
      //console.log(response);
      if (body) {
        var json = JSON.parse(body);
        if (exchange === "binance")
          resolve(parseFloat(json.price));
        if (exchange === "bittrex")
          resolve(parseFloat(json.result.Last));
        if (exchange === "huobi")
          resolve(parseFloat(json.tick.close));
        if (exchange === "krakenUSDT")
          resolve(parseFloat(json.result.USDTZUSD.c[0]));
        if (exchange === "poloniexSTEEM")
          resolve(json.BTC_STEEM.last);
        if (exchange === "poloniexBTC")
          resolve(parseFloat(json.USDT_BTC.last));
        if (exchange === "upbit")
          resolve(json[0].tradePrice);
        if (exchange === "ionomy")
          resolve(parseFloat(json.data.price));
      }
      if (error) {
        console.log(Red, error, Reset);
        resolve(0); // set the price to 0 then take care of not calculating it in the price average
      }
    });
  });
};

(async function () {
  var status = await checkAccount();
  if (status)
    console.log(utils.getDate(), "Publishing price feed now, then every", config.interval, "minutes.");
})();

priceFeed();
setInterval(function () {
  priceFeed();
}, config.interval * 60 * 1000);

async function priceFeed() {
//  var cmcSteem = await getPrice("https://api.coinmarketcap.com/v1/ticker/steem/?convert=USD");
//  var cmcPrice = parseFloat(cmcSteem[0].price_usd).toFixed(3);

  var token;

  // select blockchain from config
  if (config.hivechain) {
    token = 'HIVE';
    if (config.bittrex) {
      var bittrexUsdtBtc = await getPrice("bittrex", "https://bittrex.com/api/v1.1/public/getticker?market=usdt-btc");
      var bittrexBtcHive = await getPrice("bittrex", "https://bittrex.com/api/v1.1/public/getticker?market=btc-hive");
      var bittrexPrice = bittrexUsdtBtc * bittrexBtcHive;
    }
    if (config.ionomy) {
      // Ionomy doesn't have a USDT/BTC pair, so using the average from exchanges
      var binanceBtcUsdt = await getPrice("binance", "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      var bittrexUsdtBtc = await getPrice("bittrex", "https://bittrex.com/api/v1.1/public/getticker?market=usdt-btc");
      var poloniexUsdtBtc = await getPrice("poloniexBTC", "https://poloniex.com/public?command=returnTicker");
      var upbitUsdtBtc = await getPrice("upbit", "https://crix-api.upbit.com/v1/crix/trades/ticks?code=CRIX.UPBIT.USDT-BTC");

      var averageUsdtBtc = (binanceBtcUsdt + bittrexUsdtBtc + poloniexUsdtBtc + upbitUsdtBtc) / 4;

      var ionomyBtcHive = await getPrice("ionomy", "https://ionomy.com/api/v1/public/market-summary?market=btc-hive");
      var ionomyPrice = averageUsdtBtc * ionomyBtcHive;
    }
  }

  if (config.steemchain) {
    token = 'STEEM';
    if (config.binance) {
      var binanceSteemBtc = await getPrice("binance", "https://api.binance.com/api/v3/ticker/price?symbol=STEEMBTC");
      var binanceBtcUsdt = await getPrice("binance", "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      var binancePrice = binanceSteemBtc * binanceBtcUsdt;
    }
    if (config.bittrex) {
      var bittrexUsdtBtc = await getPrice("bittrex", "https://bittrex.com/api/v1.1/public/getticker?market=usdt-btc");
      var bittrexBtcSteem = await getPrice("bittrex", "https://bittrex.com/api/v1.1/public/getticker?market=btc-steem");
      var bittrexPrice = bittrexUsdtBtc * bittrexBtcSteem;
    }
    if (config.huobi) {
      var huobiSteemUsdt = await getPrice("huobi", "https://api.huobi.pro/market/detail/merged?symbol=steemusdt");
      var huobiPrice = huobiSteemUsdt;
    }
    if (config.poloniex) {
      var poloniexUsdtBtc = await getPrice("poloniexBTC", "https://poloniex.com/public?command=returnTicker");
      var poloniexBtcSteem = await getPrice("poloniexSTEEM", "https://poloniex.com/public?command=returnTicker");
      var poloniexPrice = poloniexUsdtBtc * poloniexBtcSteem;
    }
    if (config.upbit) {
      var upbitUsdtBtc = await getPrice("upbit", "https://crix-api.upbit.com/v1/crix/trades/ticks?code=CRIX.UPBIT.USDT-BTC");
      var upbitBtcSteem = await getPrice("upbit", "https://crix-api.upbit.com/v1/crix/trades/ticks?code=CRIX.UPBIT.BTC-STEEM");
      var upbitPrice = upbitUsdtBtc * upbitBtcSteem;
    }
  }

  var priceArray = [];

  console.log(Yellow + token + "/USDT prices" + Reset);

  if (bittrexPrice > 0) {
    console.log(("Bittrex").padEnd(8), bittrexPrice.toFixed(3));
    priceArray.push(bittrexPrice);
  }
  if (binancePrice > 0) {
    console.log(("Binance").padEnd(8), binancePrice.toFixed(3));
    priceArray.push(binancePrice);
  }
  if (huobiPrice > 0) {
    console.log(("Huobi").padEnd(8), huobiPrice.toFixed(3));
    priceArray.push(huobiPrice);
  }
  if (upbitPrice > 0) {
    console.log(("UpBit").padEnd(8), upbitPrice.toFixed(3));
    priceArray.push(upbitPrice);
  }
  if (poloniexPrice > 0) {
    console.log(("Poloniex").padEnd(8), poloniexPrice.toFixed(3));
    priceArray.push(poloniexPrice);
  }
  if (ionomyPrice > 0) {
    console.log(("Ionomy").padEnd(8), ionomyPrice.toFixed(3));
    priceArray.push(ionomyPrice);
  }

  // USDT correction. Kraken ticker info https://www.kraken.com/help/api#get-ticker-info
  var bittrexUsdUsdt = await getPrice("bittrex", "https://bittrex.com/api/v1.1/public/getticker?market=usd-usdt");
  var krakenUsdtUsd = await getPrice("krakenUSDT", "https://api.kraken.com/0/public/Ticker?pair=USDTUSD");
  var averageUSDT = ((bittrexUsdUsdt + krakenUsdtUsd) / 2).toFixed(3);

  // calculate the average
  var total = 0;
  for (var i in priceArray) {
    total += priceArray[i];
  }
  var averagePriceUSDT = (total / priceArray.length).toFixed(3);
  var averagePrice = (averagePriceUSDT * averageUSDT).toFixed(3);

  console.log(Yellow + "AVERAGE USDT/USD  ", averageUSDT + Reset);
  console.log(Yellow + "AVERAGE " + token + "/USDT", averagePriceUSDT, "(from", priceArray.length, "exchanges)" + Reset);
  console.log(Green + "AVERAGE " + token + "/USD ", averagePrice + Reset);

  var base = averagePrice + " SBD";

  var quote = "1.000";
  if (config.peg) {
    var percentage = ((1 - config['peg_multi']) * 100).toFixed(2);
    console.log('Pegging is enabled. Adjusting price by ' + percentage + '% (set config.peg to false to disable)');
    console.log('Price before the peg bias : ', averagePrice);
    quote = (1 / config['peg_multi']).toFixed(3);
    console.log('Price after the peg bias  : ', (averagePrice / quote).toFixed(3));
  }

  exchangeRate = {base: base, quote: quote + " STEEM"};


  if (config.testmode) {
    console.log(Green + utils.getDate(), 'Price feed ' + token + '/USD $' + averagePrice + Reset);
    console.log(Red + 'TEST MODE ON, NOTHING IS BROADCAST' + Reset);
  } else {
    steem.broadcast.feedPublishAsync(config.privateActiveKey, config.witness, exchangeRate)
      .then(function (data) {
        if (data)
          console.log(Green + utils.getDate(), 'Published price feed ' + token + '/USD $' + averagePrice + Reset);
      })
      .catch(function (err) {
        console.log(utils.getDate(), Red, "Error in feedPublishAsync()", err, Reset);
        if (JSON.stringify(err, null, 1).includes("RPCError: Unable to acquire database lock")) { // particular to api.steemit.com
          utils.wait(5000);
          counter = 0;
          priceFeed();
        } else {
          utils.switchrpc(counter);
          counter++;
          priceFeed();
        }
      });
  }

}
