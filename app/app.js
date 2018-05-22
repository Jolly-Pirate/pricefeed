const
        Reset = "\x1b[0m",
        Red = "\x1b[31m",
        Green = "\x1b[32m",
        Yellow = "\x1b[33m",
        request = require('request'),
        steem = require('steem'),
        config = require('./config.json'),
        utils = require('./utils.js');

var counter = 0;

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
        if (exchange === "poloniexSTEEM")
          resolve(json.BTC_STEEM.last);
        if (exchange === "poloniexBTC")
          resolve(json.USDT_BTC.last);
        if (exchange === "upbit")
          resolve(json[0].tradePrice);
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
    var poloniexUsdtBtc = await getPrice("poloniexSTEEM", "https://poloniex.com/public?command=returnTicker");
    var poloniexBtcSteem = await getPrice("poloniexBTC", "https://poloniex.com/public?command=returnTicker");
    var poloniexPrice = poloniexUsdtBtc * poloniexBtcSteem;
  }
  if (config.upbit) {
    var upbitUsdtBtc = await getPrice("upbit", "https://crix-api.upbit.com/v1/crix/trades/ticks?code=CRIX.UPBIT.USDT-BTC");
    var upbitBtcSteem = await getPrice("upbit", "https://crix-api.upbit.com/v1/crix/trades/ticks?code=CRIX.UPBIT.BTC-STEEM");
    var upbitPrice = upbitUsdtBtc * upbitBtcSteem;
  }

  var priceArray = [];

  console.log(utils.getDate(), Yellow + "Fetching STEEM/USD prices" + Reset);

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

  // calculate the average
  var total = 0;
  for (var i in priceArray) {
    total += priceArray[i];
  }
  var averagePrice = (total / priceArray.length).toFixed(3);
  console.log(Green + ("AVERAGE").padEnd(8), averagePrice, "(from", priceArray.length, "exchanges)" + Reset);

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

  steem.broadcast.feedPublishAsync(config.privateActiveKey, config.witness, exchangeRate)
          .then(function (data) {
            if (data)
              console.log(utils.getDate(), 'Published price feed STEEM/USD of $' + averagePrice);
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