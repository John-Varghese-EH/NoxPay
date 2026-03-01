# Security & Compliance

NoxPay is built with a "Security First" philosophy, ensuring that your sovereign payment gateway is as secure as centralized alternatives.

## 🛡️ API Security

- **HSTS (Strict-Transport-Security)**: Enforces HTTPS for all connections.
- **CSP (Content-Security-Policy)**: Restricts where scripts and frames can be loaded from.
- **X-Frame-Options (DENY)**: Prevents clickjacking attacks by forbidding the API/Dashboard from being embedded in iframes.
- **HMAC Webhook Signing**: Every webhook sent by NoxPay includes an `X-Nox-Signature` (HMAC-SHA256). You **must** verify this signature using your `webhook_secret` to ensure the payload hasn't been tampered with.

## 📧 Email Security (Anti-Spoofing)

The Worker performs deep verification on every incoming bank email:
1.  **DKIM (DomainKeys Identified Mail)**: Verifies the cryptographic signature of the email against the bank's public keys.
2.  **SPF (Sender Policy Framework)**: Checks if the sending server is authorized by the bank's domain.
3.  **Domain Whitelisting**: Only emails from trusted domains (e.g., `sbi.co.in`, `hdfcbank.net`) are parsed. **Spoofed emails from generic domains are instantly rejected.**

## ⛓️ Blockchain Verification

NoxPay does not rely on local logs for crypto payments. It queries the **On-Chain State** directly:
- **Finality Check**: Transactions are only settled after they reach a specific number of confirmations (standard for EVM) or "finalized" status (Solana).
- **Double-Spend Protection**: The worker maintains a cache of processed transaction hashes in Supabase to prevent re-settling the same payment twice.

## 📑 Data Privacy

Since NoxPay is sovereign:
- **No Third-Party Access**: Only you (the merchant) have access to your Supabase instance.
- **Minimal PII**: NoxPay does not store customer names or full contact details unless explicitly provided in the `metadata` field of a Payment Intent.
