const
  steem = require("steem"),
  config = require("./config.json"),
  utils = require("./utils.js");

const
  Reset = "\x1b[0m",
  Blue = "\x1b[34m",
  Green = "\x1b[32m",
  Red = "\x1b[31m",
  Yellow = "\x1b[33m",
  Underscore = "\x1b[4m";

if (config.steemchain && config.hivechain) {
  console.log("Enable only one blockchain in the app/config.json file, hivechain or steemchain, then restart");
  console.log("Exiting");
  process.exit();
}

var counter = 0;
utils.switchrpc(counter);

function checkAccount() {
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
          utils.wait(2000);
          counter = 0;
          checkAccount();
        } else {
          utils.switchrpc(counter);
          counter++;
          checkAccount();
        }
      });
  });
}

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

  var
    token,
    bittrexUsdtBtc, bittrexBtcToken, bittrexPrice, bittrexVolume,
    binanceBtcUsdt, poloniexUsdtBtc, upbitUsdtBtc, averageUsdtBtc,
    ionomyBtcToken, ionomyPrice, ionomyVolume,
    probitUsdtToken, probitPrice, probitVolume,
    binanceTokenBtc, binancePrice, binanceVolume,
    huobiTokenUsdt, huobiPrice, huobiVolume,
    poloniexBtcToken, poloniexPrice, poloniexVolume,
    upbitBtcToken, upbitPrice, upbitVolume;

  // select blockchain from config
  if (config.hivechain) {
    token = "HIVE";
    if (config.bittrex) {
      bittrexUsdtBtc = await utils.getPrice("bittrex", "USDT-BTC");
      bittrexBtcToken = await utils.getPrice("bittrex", "BTC-HIVE");
      bittrexPrice = bittrexUsdtBtc.price * bittrexBtcToken.price;
      bittrexVolume = bittrexBtcToken.volume;
    }
    if (config.ionomy) {
      // Ionomy doesn't have a USDT/BTC pair, so using the average from exchanges
      binanceBtcUsdt = await utils.getPrice("binance", "BTCUSDT");
      bittrexUsdtBtc = await utils.getPrice("bittrex", "USDT-BTC");
      poloniexUsdtBtc = await utils.getPrice("poloniex", "USDT_BTC");
      upbitUsdtBtc = await utils.getPrice("upbit", "USDT-BTC");
      averageUsdtBtc = (binanceBtcUsdt.price + bittrexUsdtBtc.price + poloniexUsdtBtc.price + upbitUsdtBtc.price) / 4;
      ionomyBtcToken = await utils.getPrice("ionomy", "btc-hive");
      ionomyPrice = averageUsdtBtc * ionomyBtcToken.price;
      ionomyVolume = ionomyBtcToken.volume;
    }
    if (config.probit) {
      probitUsdtToken = await utils.getPrice("probit", "HIVE-USDT");
      probitPrice = probitUsdtToken.price;
      probitVolume = probitUsdtToken.volume;
    }
  }

  if (config.steemchain) {
    token = "STEEM";
    if (config.binance) {
      binanceBtcUsdt = await utils.getPrice("binance", "BTCUSDT");
      binanceTokenBtc = await utils.getPrice("binance", "STEEMBTC");
      binancePrice = binanceTokenBtc.price * binanceBtcUsdt.price;
      binanceVolume = binanceTokenBtc.volume;
    }
    if (config.bittrex) {
      bittrexUsdtBtc = await utils.getPrice("bittrex", "USDT-BTC");
      bittrexBtcToken = await utils.getPrice("bittrex", "BTC-STEEM");
      bittrexPrice = bittrexUsdtBtc.price * bittrexBtcToken.price;
      bittrexVolume = bittrexBtcToken.volume;
    }
    if (config.huobi) {
      huobiTokenUsdt = await utils.getPrice("huobi", "steemusdt");
      huobiPrice = huobiTokenUsdt.price;
      huobiVolume = huobiTokenUsdt.volume;
    }
    if (config.ionomy) {
      // Ionomy doesn't have a USDT/BTC pair, so using the average from exchanges
      binanceBtcUsdt = await utils.getPrice("binance", "BTCUSDT");
      bittrexUsdtBtc = await utils.getPrice("bittrex", "USDT-BTC");
      poloniexUsdtBtc = await utils.getPrice("poloniex", "USDT_BTC");
      upbitUsdtBtc = await utils.getPrice("upbit", "USDT-BTC");
      averageUsdtBtc = (binanceBtcUsdt.price + bittrexUsdtBtc.price + poloniexUsdtBtc.price + upbitUsdtBtc.price) / 4;
      ionomyBtcToken = await utils.getPrice("ionomy", "btc-steem");
      ionomyPrice = averageUsdtBtc * ionomyBtcToken.price;
      ionomyVolume = ionomyBtcToken.volume;
    }
    if (config.poloniex) {
      poloniexUsdtBtc = await utils.getPrice("poloniex", "USDT_BTC");
      poloniexBtcToken = await utils.getPrice("poloniex", "BTC_STEEM");
      poloniexPrice = poloniexUsdtBtc.price * poloniexBtcToken.price;
      poloniexVolume = poloniexBtcToken.volume;
    }
    if (config.probit) {
      probitUsdtToken = await utils.getPrice("probit", "STEEM-USDT");
      probitPrice = probitUsdtToken.price;
      probitVolume = probitUsdtToken.volume;
    }
    if (config.upbit) {
      upbitUsdtBtc = await utils.getPrice("upbit", "USDT-BTC");
      upbitBtcToken = await utils.getPrice("upbit", "BTC-STEEM");
      upbitPrice = upbitUsdtBtc.price * upbitBtcToken.price;
      upbitVolume = upbitBtcToken.volume;
    }
  }

  var priceArray = [];

  console.log(Blue + Underscore + token + "/USDT prices and volumes" + Reset);

  if (binancePrice > 0) {
    console.log(("Binance").padEnd(8), "$" + binancePrice.toFixed(3), Math.floor(binanceVolume).toLocaleString().padStart(10));
    priceArray.push([binancePrice, binanceVolume]);
  }
  if (bittrexPrice > 0) {
    console.log(("Bittrex").padEnd(8), "$" + bittrexPrice.toFixed(3), Math.floor(bittrexVolume).toLocaleString().padStart(10));
    priceArray.push([bittrexPrice, bittrexVolume]);
  }
  if (huobiPrice > 0) {
    console.log(("Huobi").padEnd(8), "$" + huobiPrice.toFixed(3), Math.floor(huobiVolume).toLocaleString().padStart(10));
    priceArray.push([huobiPrice, huobiVolume]);
  }
  if (ionomyPrice > 0) {
    console.log(("Ionomy").padEnd(8), "$" + ionomyPrice.toFixed(3), Math.floor(ionomyVolume).toLocaleString().padStart(10));
    priceArray.push([ionomyPrice, ionomyVolume]);
  }
  if (poloniexPrice > 0) {
    console.log(("Poloniex").padEnd(8), "$" + poloniexPrice.toFixed(3), Math.floor(poloniexVolume).toLocaleString().padStart(10));
    priceArray.push([poloniexPrice, poloniexVolume]);
  }
  if (probitPrice > 0) {
    console.log(("Probit").padEnd(8), "$" + probitPrice.toFixed(3), Math.floor(probitVolume).toLocaleString().padStart(10));
    priceArray.push([probitPrice, probitVolume]);
  }
  if (upbitPrice > 0) {
    console.log(("UpBit").padEnd(8), "$" + upbitPrice.toFixed(3), Math.floor(upbitVolume).toLocaleString().padStart(10));
    priceArray.push([upbitPrice, upbitVolume]);
  }

  // Volume Weighted Average Price (VWAP)
  // VWAP= ∑(Price * Volume) / ∑Volume

  // USDT correction
  var usdtCorrectionArray = [];
  var bittrexUsdUsdt = await utils.getPrice("bittrex", "USD-USDT");
  var krakenUsdtUsd = await utils.getPrice("kraken", "USDTZUSD");

  if (bittrexUsdUsdt.price > 0)
    usdtCorrectionArray.push([bittrexUsdUsdt.price, bittrexUsdUsdt.volume]);
  if (krakenUsdtUsd.price > 0)
    usdtCorrectionArray.push([krakenUsdtUsd.price, krakenUsdtUsd.volume]);

  var total = 0;
  var totalPricexVolume = 0;
  var totalVolume = 0;
  var averageUsdt = 0, VWAPTUsdt = 0, averagePriceUsdt = 0, adjustedAverage = 0;

  for (var i in usdtCorrectionArray) {
    total += usdtCorrectionArray[i][0];
    totalPricexVolume += usdtCorrectionArray[i][0] * usdtCorrectionArray[i][1];
    totalVolume += usdtCorrectionArray[i][1];
  }

  // average
  if (usdtCorrectionArray.length > 0) {
    averageUsdt = (total / usdtCorrectionArray.length).toFixed(3);
    VWAPTUsdt = (totalPricexVolume / totalVolume).toFixed(3);
  }

  // reset the totals
  total = 0;
  totalPricexVolume = 0;
  totalVolume = 0;

  for (var j in priceArray) {
    total += priceArray[j][0];
    totalPricexVolume += priceArray[j][0] * priceArray[j][1];
    totalVolume += priceArray[j][1];
  }

  // average
  if (priceArray.length > 0) {
    averagePriceUsdt = (total / priceArray.length).toFixed(3);
    adjustedAverage = (averagePriceUsdt * averageUsdt).toFixed(3);
  }

  console.log(Blue + Underscore + "Average Price", "(from", priceArray.length, "exchanges)" + Reset);
  console.log(Yellow + "USDT/USD  ", averageUsdt + Reset);
  console.log(Yellow + token + "/USDT", averagePriceUsdt + Reset);
  console.log(Green + token + "/USD ", adjustedAverage + Reset);

  // VWAP
  var VWAP = 0, adjustedVWAP = 0;
  if (totalPricexVolume > 0 && totalVolume > 0) { // avoid div 0
    VWAP = (totalPricexVolume / totalVolume).toFixed(3);
    adjustedVWAP = (VWAP * VWAPTUsdt).toFixed(3);
  }

  console.log(Blue + Underscore + "Volume Weighted Average Price (VWAP)", "(from", priceArray.length, "exchanges)" + Reset);
  console.log(Yellow + "USDT/USD  ", VWAPTUsdt + Reset);
  console.log(Yellow + token + "/USDT", VWAP + Reset);
  console.log(Green + token + "/USD ", adjustedVWAP + Reset);

  var base = adjustedVWAP + " SBD";

  var quote = "1.000";
  if (config.peg) {
    var percentage = ((1 - config["peg_multi"]) * 100).toFixed(2);
    console.log("Pegging is enabled. Adjusting price by " + percentage + "% (set config.peg to false to disable)");
    console.log("Price before the peg bias : ", adjustedVWAP);
    quote = (1 / config["peg_multi"]).toFixed(3);
    console.log("Price after the peg bias  : ", (adjustedVWAP / quote).toFixed(3));
  }

  var exchangeRate = {base: base, quote: quote + " STEEM"};

  if (Number(adjustedVWAP) === 0)
    console.log(Red + "PROBLEM WITH VWAP" + Reset);

  if (config.testmode)
    console.log(Red + "TEST MODE ON, NOTHING IS BROADCAST" + Reset);

  if (!config.testmode && Number(adjustedVWAP) > 0) {
    steem.broadcast.feedPublishAsync(config.privateActiveKey, config.witness, exchangeRate)
      .then(function (data) {
        if (data)
          console.log(Green + utils.getDate(), "Published price feed " + token + "/USD $" + adjustedVWAP + Reset);
      })
      .catch(function (err) {
        console.log(utils.getDate(), Red, "Error in feedPublishAsync()", err, Reset);
        if (JSON.stringify(err, null, 1).includes("RPCError: Unable to acquire database lock")) {
          utils.wait(2000);
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
