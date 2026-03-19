---
slug: /security
---

# Security & Robustness

NoxPay is built with a "Security First" mindset to ensure your payments are safe and your infrastructure is resilient.

## 🔐 Authentication

All API requests rely on two core headers:
- `X-Client-ID`: Your public merchant identifier.
- `X-Client-Secret`: Your private API secret (starts with `sk_live_`).

**Security Tip**: Never expose your `X-Client-Secret` in client-side code or public repositories.

## 🛡️ Webhook Verification (HMAC-SHA256)

Every settlement notification sent to your `webhook_url` includes a signature. We use **HMAC-SHA256** to sign the payload using your unique `webhook_secret`.

### Replay Protection
We include a `X-NoxPay-Timestamp` header. We recommend verifying that this timestamp is within the last 5 minutes to prevent replay attacks.

[See Webhook Verification Guide](../2-api-integrations/webhook_verification.md)

## 🌐 IP Whitelisting

For maximum security, you can configure `allowed_ips` in your Merchant Dashboard. If configured, NoxPay will reject any API request coming from an unauthorized IP address.

## 🚦 Rate Limiting & Burst Protection

To protect the system from DDoS attacks and abusive clients, we enforce a strict rate limit per merchant.
- **Default Limit**: 100 requests per minute (RPM).
- **Burst Tolerance**: We allow a **20% burst** (up to 120 RPM) for short spikes to ensure your legitimate traffic isn't dropped during peak hours.

## 🚀 Technical Hardening

NoxPay implementation includes:
- **HSTS (Strict-Transport-Security)**: Ensuring all connections are over HTTPS.
- **CSP (Content-Security-Policy)**: Protecting the checkout from XSS and frame injection.
- **X-Frame-Options: DENY**: Preventing clickjacking attacks.
- **Nosniff & X-XSS**: Standard browser hardening headers.

---

[Github: John-Varghese-EH](https://github.com/John-Varghese-EH) | [Instagram: @cyber__trinity](https://www.instagram.com/cyber__trinity/)
Project URL: [github.com/John-Varghese-EH/NoxPay](https://github.com/John-Varghese-EH/NoxPay)
