<p align="center"><img src="./src/assets/switch-logo.svg" width="250" /></p>
<p align="center">
💸 Swap BTC, ETH, XRP in seconds. Keep your private keys private. 🔒
</p>

![Switch swap screen cropped](./screenshots/swap-eth-btc-cropped.png)

<div align="center">

[![GitHub release](https://img.shields.io/github/release/Kava-Labs/switch.svg)](https://github.com/Kava-Labs/switch/releases/latest)
[![GitHub All Releases](https://img.shields.io/github/downloads/kava-labs/switch/total.svg)](https://github.com/Kava-Labs/switch/releases)
[![GitHub](https://img.shields.io/github/license/Kava-Labs/switch.svg)](https://github.com/Kava-Labs/switch/blob/master/LICENSE)
[![Discourse users](https://img.shields.io/discourse/https/forum.interledger.org/users.svg)](https://forum.interledger.org)
[![Twitter Follow](https://img.shields.io/twitter/follow/kava_labs.svg?label=Follow&style=social)](https://twitter.com/kava_labs)

</div>

Switch is the fastest, most secure way to swap cryptocurrencies. Recent developments in blockchain scaling enable lightning-fast swaps, interoperability across blockchains, and complete self-custody of assets.

Load funds onto "cards", easily swap between them, and unload when you're done. Only you have access to these funds and, thanks to streaming micropayments, even while trading you retain full asset custody!

# [Get Started](#get-started)

### 1) Download Switch

#### &raquo; [Mac](https://github.com/Kava-Labs/switch/releases/latest/download/Switch-0.2.0.dmg) | [Windows](https://github.com/Kava-Labs/switch/releases/latest/download/Switch.Setup.0.2.0.exe) | [Linux](https://github.com/Kava-Labs/switch/releases/latest/download/Switch.0.2.0.AppImage) &laquo;

Switch will prompt you whether you want to use testnet mode or mainnet mode. To get started, we suggest selecting testnet (you can always switch to mainnet mode later).

### 2) Add cards

Add a minimum of two cards. ETH and XRP are the easiest to get started.

- **ETH**: Add an Ethereum card using a private key. You can generate a private key and address [here](https://vanity-eth.tk). Then, load the address with testnet ether from [the Kovan testnet faucet](https://faucet.kovan.network/).
- **XRP**: Add an XRP card using a XRP secret. If you don't have a testnet account, generate a prefunded account and secret from [the XRP testnet faucet](https://developers.ripple.com/xrp-test-net-faucet.html).
- **BTC**: To add a Lightning card, follow these [instructions](docs/lightning-setup.md).
- Switch will prompt you to securely deposit funds onto your cards as you add them. Only you have access to these funds.

### 3) Swap!

Select a card to send, then click "Swap" and choose a card to receive. Enter the desired amount, and begin exchanging crypto!

![Screenshot Home](./screenshots/home-eth-btc-xrp.png)
![Screenshot Swap](./screenshots/swap-xrp-eth-success.png)

# How It Works

## Fast Non-custodial Trading

When trading between assets, Switch will first send a very small amount of the source asset, the equivalent of \$0.10, to the exchange party known as the connector. Then, the connector sends some amount of the destination asset. If the connector upholds its side of the bargain and the exchange rate it provides is decent, we repeat the process. And again. And again; many times per second.

This is the model of streaming micropayments: moving value bit-by-bit until the entire payment or trade is complete.

If at any point the connector stops sending or sends too little of the destination asset, we halt the exchange. This enables non-custodial trading, since the counterparty risk is merely a few cents.

[Payment channels](docs/faqs.md#what-is-layer-2-and-payment-channels) enable these payments to be cheap and fast.

Switch uses Kava as the default connector, but we will be expanding this to user-defined connectors in the near future.

## Links

- [FAQs](docs/faqs.md)
- [Setup Swaps Over Lightning](docs/lightning-setup.md)
- [What is layer 2? What are payment channels?](docs/faqs.md#what-is-layer-2-and-payment-channels)
- [What is Interledger?](docs/faqs.md#what-is-interledger)

## Developer Installation

```shell
> git clone https://github.com/kava-labs/switch
> cd switch
> npm install
> npm run serve
```

# Roadmap

- [x] Integration of the top three cryptocurrencies
- [x] Mainnet
- [ ] Custom connectors
- [ ] Peer-to-peer payments
- [ ] Cards for ERC-20 tokens, such as Dai

# License

Copyright © Kava Labs, Inc. All rights reserved.

Licensed under the [Apache v2 License](LICENSE).
