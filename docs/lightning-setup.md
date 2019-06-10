# Setup Lightning

1.  [Download and setup Zap](https://github.com/LN-Zap/zap-desktop#install) on testnet.
    - You'll need to create or import a testnet wallet and get some testnet BTC from the faucet (link provided in Zap).
2.  Create a channel to the Kava connector.
    - Find the manage channels page in Zap.
    - Click `create new channel` and search for the node named `kava-test-2`. Create a channel for more than the amount you want to trade.
    - In the future, when the Lightning Network is more mature, this step won't be necessary.
3.  Create a Lightning card in Switch
    - Hostname: `localhost`
    - gRPC Port: `11009`
    - The TLS certificate can be found in the data directory for Zap. The file needs to be base64 encoded. On Mac, this command will print it: `cat "~/Library/Application Support/Zap/lnd/bitcoin/testnet/<wallet name>/tls.cert" | base64`
    - The admin macaroon can also be found in the data directory for Zap, and also must be base64 encoded. On Mac, this command will print it: `cat "~/Library/Application Support/Zap/lnd/bitcoin/testnet/<wallet name>/data/chain/bitcoin/testnet/admin.macaroon" | base64`
    - Note: `<wallet-name>` above should be replaced with the name of your wallet, usually "wallet-1".
