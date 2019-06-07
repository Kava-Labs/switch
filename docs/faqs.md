# Are my funds secure?

Yes. Switch is architected so you never need to trust a third party to hold your money. Before, during, and after a trade, your money is only ever accessible to you.

By comparison, centralized cryptocurrency exchanges hold your money on your behalf and are regularly hacked, losing users' funds.

# How is it so fast?

Switch achieves its combination of speed and security by building on recent developements in blockchain scaling. It uses the Interledger protocol for coordinating routing and exchange, and payment channels for speed and security.

# What is Interledger?

Interledger is an open protocol suite for sending payments across different ledgers. Modelled after the Internet protocols, it coordinates packets of money to be routed across independent payment networks through a network of untrusted nodes. The open architecture and minimal protocol enable interoperability for any value transfer system. Interledger is not tied to any one company, blockchain, or currency.

[This medium post](https://medium.com/xpring/interledger-how-to-interconnect-all-blockchains-and-value-networks-74f432e64543) gives a good overview of the protocol.

# What is "layer 2"? What are "payment channels"?

Payment channels are a technology to speed up payments on blockchains while retaining strong security guarantees.

Money is transferred on the blockchain to a secure holding place. Then special messages can be sent between the sender and receiver that enable each to withdraw money from the holding place. Depending on the messages sent, the sender and receiver can withdraw varying amounts from the holding place; hence the messages act as real payments. These channels can then be linked together to send payments to anyone, rather than just the original two parties.

The longer money is held in channels the cheaper and faster payments can be overall. This idea of holding money in these channels is known as being "on layer 2" (as they form a layer above the underlying blockchain, which itself is known as layer 1).

# Why can't I trade sometimes, even though I have a balance?

Your money in the balance is secured in payment channels. For XRP and ETH, Switch uses unidirectional payment channels (one from you to the connector, and another from the connector to you). When you receive money in a one-way payment channel, it's fully in your custody, but you can't send it directly back to the connector.

After a few trades, you may have exhausted the funds in the outgoing channel from you to the connector (sent all or most of the funds to the connector). To fix this, deposit additional funds to the card, which will replenish the payment channel.

# Why can't I see all my money on a card?

The card balance shows how much is held in "layer 2," that is, in payment channels. The rest of your funds are safely stored in the underlying blockchain and are viewable in an external wallet app.
