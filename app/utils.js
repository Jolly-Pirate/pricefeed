const
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
  var maxrpc = config.rpc.length;

  if (config.rpc && counter !== maxrpc) {
    wait(5000);

    steem.api.setOptions({url: config.rpc[counter], useAppbaseApi: true});
    console.log(getDate(), "Switching to RPC", config.rpc[counter]);

    //process.stderr.write("\x07");// "\007" beep
  } else {
    console.log(getDate(), "Cycled through and exhausted all RPCs. Exiting.");
    process.exit();
  }
}

module.exports = {
  getAccountInfo,
  checkPrivateKey,
  getDate,
  wait,
  switchrpc
};
