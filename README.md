<img src="./src/assets/switch-logo.svg" width="200" />

- 🏁 **Swap crypto assets in seconds with Interledger**
- 🔒 **Secure non-custodial trading**
- 💸 **Onboarding to layer 2 networks**

[INSERT SCREENSHOT/GIF HERE]

## Get Started

Download the latest release for Mac, Windows and Linux [here](https://github.com/Kava-Labs/switch/releases/latest). Switch is currently only available on testnet.

In Switch, you can create and load funds onto "cards" to swap between assets. Only you have access to these funds. Thanks to streaming micropayments, even while trading, you retain full asset custody!

Switch supports cards for a few different crypto assets:
- **XRP**, on the [XRP testnet](https://developers.ripple.com/xrp-test-net-faucet.html)
- **ETH**, using the Kovan Ethereum testnet ([faucet here](https://github.com/kovan-testnet/faucet))
- **BTC**, using the Lightning Network on the Bitcoin testnet (requires an LND node)

### Non-custodial Trading

When trading between assets, Switch will first send a very small amount of the source asset — the equivalent of $0.05, by default — to the connector. Then, the connector sends some amount of the destination asset. If the connector upholds its side of the bargain and the exchange rate it provides is decent, we repeat the process. And again. And again; many times per second.

This is the model of streaming micropayments: moving value bit-by-bit until the entire payment or trade is complete.

If at any point the connector stops sending or sends too little of the destination asset, we halt the exchange. This enables non-custodial trading, since the counterparty risk is merely a few cents.

Switch uses Kava as the default connector, but we hope to expand this to user-defined connectors in the near future.

### Roadmp

- [ ] Custom connectors
- [ ] Peer-to-peer payments
- [ ] Cards for ERC-20 tokens, such as Dai
