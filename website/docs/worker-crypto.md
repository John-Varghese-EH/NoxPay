# Crypto Observability

NoxPay tracks blockchain transactions in real-time to provide a seamless checkout experience for crypto payments.

## ⛓️ Supported Networks

- **Solana**: Real-time monitoring for **USDC** and **SOL** deposits.
- **Polygon (PoS)**: High-speed tracking for **USDT** (ERC-20) transfers.

## 🔍 The Crypto Observer

The Worker includes a `CryptoObserver` class that polls public RPC nodes to find payments matching your merchant address.

### Solana Polling
The worker uses the `getSignaturesForAddress` and `getTransaction` RPC methods to:
1.  Monitor your Solana wallet for new incoming signatures.
2.  Parse the `jsonParsed` transaction data to verify the recipient and amount.
3.  Cross-reference the transaction hash as proof of payment.

### Polygon/Ethereum Polling
For EVM-compatible chains like Polygon, the worker:
1.  Uses `eth_getLogs` to monitor **Transfer** events from the USDT smart contract.
2.  Filters events where the `to` address matches your configured merchant wallet.
3.  Extracts the `transactionHash` for settlement verification.

## ⚙️ RPC Configuration

For production use, we recommend using a private RPC provider (e.g., Helius, Alchemy, or QuickNode) to avoid rate limits on public nodes.

Configure your nodes in the `.env` file:
- `SOLANA_RPC_URL`: Your Solana RPC endpoint.
- `POLYGON_RPC_URL`: Your Polygon RPC endpoint.
- `SOLANA_WATCH_ADDRESS`: Your merchant wallet address for Solana.
- `POLYGON_WATCH_ADDRESS`: Your merchant wallet address for Polygon.

## ⏳ Poll Interval

By default, the worker polls crypto networks every **10 seconds**. This ensures customers see a "Payment Confirmed" screen shortly after their transaction is finalized on the blockchain.
