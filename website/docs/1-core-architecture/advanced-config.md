---
slug: /advanced-config
---

# Advanced Configuration

NoxPay is highly configurable to suit different merchant needs. This guide explains the environment variables and internal settings.

## 🛠️ Environment Variables (.env)

These are used across the API, Dashboard, and Worker.

### API & Dashboard
- `MASTER_API_KEY`: A 64-character hex string used for internal communication between the Dashboard and the API. **Never share this.**
- `JWT_SECRET`: Used for signing merchant session tokens.
- `ALLOWED_ORIGINS`: A comma-separated list of domains allowed to make CORS requests to the API (e.g., `https://yourcheckout.com`).

### Worker (Python)
- `POLL_INTERVAL`: How often (in seconds) the worker polls blockchain nodes and IMAP. Default is `5`.
- `IMAP_SERVER`: The IMAP endpoint (e.g., `imap.gmail.com`).
- `SOLANA_RPC_URL`: A custom Solana RPC node (e.g., H2 atau Alchemy).
- `POLYGON_RPC_URL`: A custom Polygon RPC node.

## 🏦 Bank Parser Customization

If your bank is not supported, you can add a new parser in `worker/parser.py`:
1.  Inherit from the `BankParser` abstract base class.
2.  Implement the `parse(email_body)` method to extract `amount` and `utr`.
3.  Register your new class in the `ParserRegistry`.

## 🛡️ Rate Limiting

The API uses a **Sliding Window** rate limiter. Each merchant has a configurable `rate_limit` (stored in the Supabase `clients` table).
- **Burst Tolerance**: NoxPay automatically allows a **20% burst** above the configured limit to handle traffic spikes.
- **Example**: If your limit is 100 RPM, you can burst up to 120 RPM before receiving a `429` error.
