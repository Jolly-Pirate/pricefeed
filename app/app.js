const
  Reset = "\x1b[0m",
  Blue = "\x1b[34m",
  Green = "\x1b[32m",
  Red = "\x1b[31m",
  Yellow = "\x1b[33m",
  Underscore = "\x1b[4m",
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
      var bittrexUsdtBtc = await utils.getPrice("bittrex", "usdt-btc");
      var bittrexBtcToken = await utils.getPrice("bittrex", "btc-hive");
      var bittrexPrice = bittrexUsdtBtc.price * bittrexBtcToken.price;
      var bittrexVolume = bittrexBtcToken.volume;
    }
    if (config.ionomy) {
      // Ionomy doesn't have a USDT/BTC pair, so using the average from exchanges
      var binanceBtcUsdt = await utils.getPrice("binance", "BTCUSDT");
      var bittrexUsdtBtc = await utils.getPrice("bittrex", "usdt-btc");
      var poloniexUsdtBtc = await utils.getPrice("poloniex", "USDT_BTC");
      var upbitUsdtBtc = await utils.getPrice("upbit", "USDT-BTC");
      var averageUsdtBtc = (binanceBtcUsdt.price + bittrexUsdtBtc.price + poloniexUsdtBtc.price + upbitUsdtBtc.price) / 4;
      var ionomyBtcToken = await utils.getPrice("ionomy", "btc-hive");
      var ionomyPrice = averageUsdtBtc * ionomyBtcToken.price;
      var ionomyVolume = ionomyBtcToken.volume;
    }
    if (config.probit) {
      var probitUsdtToken = await utils.getPrice("probit", "HIVE-USDT");
      var probitPrice = probitUsdtToken.price;
    }

    if (config.probit) {
      var probitUsdtToken = await utils.getPrice("probit", "HIVE-USDT");
      var probitPrice = probitUsdtToken.price;
      var probitVolume = probitUsdtToken.volume;
    }

  }

  if (config.steemchain) {
    token = 'STEEM';
    if (config.binance) {
      var binanceBtcUsdt = await utils.getPrice("binance", "BTCUSDT");
      var binanceTokenBtc = await utils.getPrice("binance", "STEEMBTC");
      var binancePrice = binanceTokenBtc.price * binanceBtcUsdt.price;
      var binanceVolume = binanceTokenBtc.volume;
    }
    if (config.bittrex) {
      var bittrexUsdtBtc = await utils.getPrice("bittrex", "usdt-btc");
      var bittrexBtcToken = await utils.getPrice("bittrex", "btc-steem");
      var bittrexPrice = bittrexUsdtBtc.price * bittrexBtcToken.price;
      var bittrexVolume = bittrexBtcToken.volume;
    }
    if (config.huobi) {
      var huobiTokenUsdt = await utils.getPrice("huobi", "steemusdt");
      var huobiPrice = huobiTokenUsdt.price;
      var huobiVolume = huobiTokenUsdt.volume;
    }
    if (config.poloniex) {
      var poloniexUsdtBtc = await utils.getPrice("poloniex", "USDT_BTC");
      var poloniexBtcToken = await utils.getPrice("poloniex", "BTC_STEEM");
      var poloniexPrice = poloniexUsdtBtc.price * poloniexBtcToken.price;
      var poloniexVolume = poloniexBtcToken.volume;
    }
    if (config.upbit) {
      var upbitUsdtBtc = await utils.getPrice("upbit", "USDT-BTC");
      var upbitBtcToken = await utils.getPrice("upbit", "BTC-STEEM");
      var upbitPrice = upbitUsdtBtc.price * upbitBtcToken.price;
      var upbitVolume = upbitBtcToken.volume;
    }
    if (config.probit) {
      var probitUsdtToken = await utils.getPrice("probit", "STEEM-USDT");
      var probitPrice = probitUsdtToken.price;
      var probitVolume = probitUsdtToken.volume;
    }
    if (config.ionomy) {
      // Ionomy doesn't have a USDT/BTC pair, so using the average from exchanges
      var binanceBtcUsdt = await utils.getPrice("binance", "BTCUSDT");
      var bittrexUsdtBtc = await utils.getPrice("bittrex", "usdt-btc");
      var poloniexUsdtBtc = await utils.getPrice("poloniex", "USDT_BTC");
      var upbitUsdtBtc = await utils.getPrice("upbit", "USDT-BTC");
      var averageUsdtBtc = (binanceBtcUsdt.price + bittrexUsdtBtc.price + poloniexUsdtBtc.price + upbitUsdtBtc.price) / 4;
      var ionomyBtcToken = await utils.getPrice("ionomy", "btc-steem");
      var ionomyPrice = averageUsdtBtc * ionomyBtcToken.price;
      var ionomyVolume = ionomyBtcToken.volume;
    }

  }

  var priceArray = [];
  var volumeArray = [];

  console.log(Blue + Underscore + token + "/USDT prices and volumes" + Reset);

  if (binancePrice > 0) {
    console.log(("Binance").padEnd(8), "$" + binancePrice.toFixed(3), binanceVolume.toFixed(3).padStart(12));
    priceArray.push(binancePrice);
    volumeArray.push(binanceVolume);
  }
  if (bittrexPrice > 0) {
    console.log(("Bittrex").padEnd(8), "$" + bittrexPrice.toFixed(3), bittrexVolume.toFixed(3).padStart(12));
    priceArray.push(bittrexPrice);
    volumeArray.push(bittrexVolume);
  }
  if (huobiPrice > 0) {
    console.log(("Huobi").padEnd(8), "$" + huobiPrice.toFixed(3), huobiVolume.toFixed(3).padStart(12));
    priceArray.push(huobiPrice);
    volumeArray.push(huobiVolume);
  }
  if (ionomyPrice > 0) {
    console.log(("Ionomy").padEnd(8), "$" + ionomyPrice.toFixed(3), ionomyVolume.toFixed(3).padStart(12));
    priceArray.push(ionomyPrice);
    volumeArray.push(ionomyVolume);
  }
  if (poloniexPrice > 0) {
    console.log(("Poloniex").padEnd(8), "$" + poloniexPrice.toFixed(3), poloniexVolume.toFixed(3).padStart(12));
    priceArray.push(poloniexPrice);
    volumeArray.push(poloniexVolume);
  }
  if (probitPrice > 0) {
    console.log(("Probit").padEnd(8), "$" + probitPrice.toFixed(3), probitVolume.toFixed(3).padStart(12));
    priceArray.push(probitPrice);
    volumeArray.push(probitVolume);
  }
  if (upbitPrice > 0) {
    console.log(("UpBit").padEnd(8), "$" + upbitPrice.toFixed(3), upbitVolume.toFixed(3).padStart(12));
    priceArray.push(upbitPrice);
    volumeArray.push(upbitVolume);
  }

  // Volume Weighted Average Price (VWAP)
  // VWAP= ∑(Price * Volume) / ∑Volume

  // USDT correction.
  var bittrexUsdUsdt = await utils.getPrice("bittrex", "usd-usdt");
  var krakenUsdtUsd = await utils.getPrice("kraken", "USDTUSD");

  var averageUsdt = ((bittrexUsdUsdt.price + krakenUsdtUsd.price) / 2).toFixed(3);
  var VWAPTUsdt = ((bittrexUsdUsdt.price * bittrexUsdUsdt.volume + krakenUsdtUsd.price * krakenUsdtUsd.volume) / (bittrexUsdUsdt.volume + krakenUsdtUsd.volume)).toFixed(3);

  var total = 0;
  var totalPricexVolume = 0;
  var totalVolume = 0;

  for (var i in priceArray) {
    total += priceArray[i];
    totalPricexVolume += priceArray[i] * volumeArray[i];
    totalVolume += volumeArray[i];
  }

  // VWAP
  var VWAP = (totalPricexVolume / totalVolume).toFixed(3);
  var adjustedVWAP = (VWAP * VWAPTUsdt).toFixed(3);

  // average
  var averagePriceUsdt = (total / priceArray.length).toFixed(3);
  var adjustedAverage = (averagePriceUsdt * averageUsdt).toFixed(3);


  console.log(Blue + Underscore + "Average Price", "(from", priceArray.length, "exchanges)" + Reset);
  console.log(Yellow + "USDT/USD  ", averageUsdt + Reset);
  console.log(Yellow + token + "/USDT", averagePriceUsdt + Reset);
  console.log(Green + token + "/USD ", adjustedAverage + Reset);

  console.log(Blue + Underscore + "Volume Weighted Average Price (VWAP)", "(from", priceArray.length, "exchanges)" + Reset);
  console.log(Yellow + "USDT/USD  ", VWAPTUsdt + Reset);
  console.log(Yellow + token + "/USDT", VWAP + Reset);
  console.log(Green + token + "/USD ", adjustedVWAP + Reset);

  var base = adjustedVWAP + " SBD";

  var quote = "1.000";
  if (config.peg) {
    var percentage = ((1 - config['peg_multi']) * 100).toFixed(2);
    console.log('Pegging is enabled. Adjusting price by ' + percentage + '% (set config.peg to false to disable)');
    console.log('Price before the peg bias : ', adjustedVWAP);
    quote = (1 / config['peg_multi']).toFixed(3);
    console.log('Price after the peg bias  : ', (adjustedVWAP / quote).toFixed(3));
  }

  exchangeRate = {base: base, quote: quote + " STEEM"};


  if (config.testmode) {
    console.log(Green + utils.getDate(), 'Price feed ' + token + '/USD $' + adjustedVWAP + Reset);
    console.log(Red + 'TEST MODE ON, NOTHING IS BROADCAST' + Reset);
  } else {
    steem.broadcast.feedPublishAsync(config.privateActiveKey, config.witness, exchangeRate)
      .then(function (data) {
        if (data)
          console.log(Green + utils.getDate(), 'Published price feed ' + token + '/USD $' + adjustedVWAP + Reset);
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
