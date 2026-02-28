# NoxPay: Sovereign SaaS Payment Gateway 🌌

<div align="center">
  <img src="dashboard/src/app/icon.svg" alt="NoxPay Logo" width="140" />
  <h3><b>The Ultimate Self-Hosted UPI & Crypto Checkouts</b></h3>
  <p>Eliminate middleman fees. Retain 100% of your revenue. Deploy your own payment infrastructure in minutes.</p>

  [![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black.svg?logo=vercel)](https://vercel.com/)
  [![Supabase Powered](https://img.shields.io/badge/Supabase-Database-emerald.svg?logo=supabase)](https://supabase.com/)
  [![Next.js 14](https://img.shields.io/badge/Next.js-14.2-blue.svg?logo=nextdotjs)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688.svg?logo=fastapi)](https://fastapi.tiangolo.org/)
</div>

---

## ⚡ Core Features

NoxPay is designed to give you the same high-end experience as Stripe or Razorpay, but without the 3% transaction fees.

### 💳 Modern Checkout Experience
- **Live QR Codes**: Instant scannable UPI and Crypto QR codes generated on-the-fly.
- **Real-time Status Polling**: The checkout page automatically redirects to "Success" the moment funds are verified via websockets (Supabase Realtime).
- **Live Expiry Timers**: Precise MM:SS countdowns on every checkout link to create urgency and ensure fresh pricing.
- **Embeddable Widget**: A clean, iframe-optimized checkout flow (`/widget`) you can drop into any website.

### 🛠️ Merchant Dashboard
- **No-Code Payment Links**: Create and share checkouts instantly via a simple form. No API knowledge required.
- **Branding Live Preview**: See exactly how your checkout looks as you customize your brand color and logo on the Settings page.
- **Webhook Observability**: Track every webhook delivery, view response codes, and manually "Retry" failed deliveries with one click.
- **Crypto Tab**: Dedicated space for tracking USDT (TRC20) and Crypto payments alongside traditional UPI.

---

## 🔒 Security Infrastructure

Security isn't an afterthought; it's the foundation of NoxPay.

- **HMAC-SHA256 Webhooks**: Every webhook is cryptographically signed. NoxPay uses a dedicated `webhook_secret` distinct from your API keys.
- **Replay Protection**: Timestamps are included in all signatures to prevent payload interception and re-use.
- **bcrypt API Secrets**: Your Client Secrets are hashed using industry-standard bcrypt. Even if the database is compromised, your secrets remain unreadable.
- **Row-Level Security (RLS)**: Every database query is restricted to the authenticated merchant at the Postgres level.
- **Identity Verification**: Background workers verify bank alerts against specific transaction notes to prevent UTR spoofing.

---

## 🎨 Professional Customization

NoxPay gives you total control over your brand identity:

1. **Brand Identity**: Upload your logo and set your primary theme color.
2. **Interactive Preview**: Use the real-time preview widget in Settings to see your branding across Desktop and Mobile views instantly.
3. **Theme Presets**: Choose from curated professional palettes like *Midnight Blue, Emerald Green, or Rose Crush*.
4. **Custom Return URLs**: Define exactly where users go after a successful payment attempt.

---

## 🌍 International Payments (The "Free" Method)

**Can I accept international payments for free?**
Yes. Traditional gateways (Stripe/PayPal) charge 4-7% for international transactions. NoxPay solves this via **USDT (Crypto) Integration**.

- **Sovereign Settlement**: By using the USDT (TRC20) payment method in NoxPay, you can accept payments from anyone, anywhere in the world, instantly.
- **$0 Gateway Fees**: You pay zero percentage to NoxPay. You only deal with standard blockchain network gas fees (usually <$1).
- **Zero Chargebacks**: Unlike credit cards, crypto payments are final, protecting you from international fraud and disputes.

---

## 🚀 One-Click Quickstart

### 1. Platform (Dashboard + API)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJohn-Varghese-EH%2FNoxPay)

1. Click the button above to clone and deploy to Vercel.
2. Vercel automatically routes `/api/*` to the Python backend and everything else to the Next.js frontend.
3. Add your Supabase Environment Variables.

### 2. Verification Worker
Deploy the background worker to any persistent VPS (Ubuntu/Debian) to start matching bank alerts:
```bash
chmod +x hidencloud_setup.sh
./hidencloud_setup.sh
```

---

## 📈 Integration Example

**Create a Payment Intent via API:**
```bash
curl -X POST https://your-noxpay.vercel.app/api/v1/intents/create-payment \
  -H "X-Client-ID: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Client-Secret: sk_test_..." \
  -d '{
    "amount": 25.00,
    "currency": "USDT",
    "order_id": "INV_98765"
  }'
```

---

Crafted with ❤️ by **[John Varghese (J0X)](https://github.com/John-Varghese-EH)**  
*NoxPay is an open-source payment protocol. Use responsibly.*
