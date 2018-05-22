# STEEM Price Feed
A price feed application written in NodeJS for witnesses on the Steem network.

## Features
- Application esilience with NodeJS restart on crash/exit.
- Automatic RPC switching.
- Averaged price from up to 5 major cryptocurrency exchanges.

# Pre-install (e.g. Ubuntu 16.04)
Requires NodeJS >7.6 (for the async functions).
```
sudo apt update
sudo apt install -y curl software-properties-common gnupg build-essential libssl-dev
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i npm@latest -g
```

# Install
```
git clone https://github.com/Jolly-Pirate/pricefeed.git
cd pricefeed
cp app/config.json.example app/config.json
chmod 600 app/config.json
```

Edit the app/config.json then start the app with
```
npm start
```

### Screen session example
Start and enter a screen session: `screen -S pricefeed`

Start the script: `npm start`

Detach from the screen session with `CTRL-a-d`. This will leave it running in the background.

Reattach to the session with `screen -x pricefeed` to monitor its status. 

If you want to terminate the script press `CTRL-c`, then type `exit` to close the session.

---

# Docker install (recommended)
```
git clone https://github.com/Jolly-Pirate/pricefeed.git
cd pricefeed
chmod +x run.sh
./run.sh install_docker
./run.sh build
```
Edit the file `app/config.json` accordingly (see the section below), then start the container with
```
./run.sh start
```

Check that it's running fine with `./runs.sh logs`

Type `./run.sh` without arguments for a list of options.

---

# Configuration
The configuration is located in the file `app/config.json`.

- witness: witness account
- privateActiveKey : private active key of the witness account
- interval : delay between each feed publishing.
- peg : set to true only if you want to adjust your price feed bias.
- peg_multi : if "peg" is set to true, then this will change the "quote" to 1 / peg_multi. e.g. peg_multi of 2 it will show a 100% bias on the feed.
- rpc: Steem RPC nodes

The different exchanges can be set to `true` or `false`. Poloniex is set to false by default because of their constant wallet problems.

