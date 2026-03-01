# Introduction

Welcome to the NoxPay Documentation. NoxPay is a sovereign, self-hosted payment gateway for Indian merchants and international businesses looking to accept UPI, USDT (TRC20), and more.

## 🚀 Vision

Our mission is to empower developers and businesses with a payment platform that:
- **Ensures Sovereignty**: You own your data and your bank/wallet integrations.
- **Minimizes Fees**: No per-transaction percentages, just a sleek, high-performing system you control.
- **Simplifies Cryptography**: Real-time blockchain and bank notifications handled by a robust worker system.

## 🛠️ Core Features

- **UPI Auto-Settlement**: Live monitoring of bank accounts via IMAP for instant transaction verification.
- **Crypto Observability**: Real-time tracking of USDT (TRC20) and Solana (USDC/SOL) payments.
- **Multi-Language Checkout**: Clean, professional checkout flows in English and Hindi.
- **Merchant Dashboard**: No-code payment link creation and detailed transaction monitoring.
- **Webhook System**: Robust HMAC-signed webhooks with persistent retry logic.
- **Technical Robustness**: IP whitelisting, burst-tolerant rate limiting, and security headers.

## 🏁 How NoxPay Works

NoxPay uses a three-pillar architecture:
1. **The API (FastAPI)**: Handles payment intent creation, webhook delivery, and client authenticated requests.
2. **The Dashboard (Next.js)**: Provides an interface for merchants to manage projects and view analytics.
3. **The Worker (Python)**: The engine that listens to bank emails and blockchain nodes to verify payments in real-time.

---

[Github: John-Varghese-EH](https://github.com/John-Varghese-EH) | [Instagram: @cyber__trinity](https://www.instagram.com/cyber__trinity/)
Project URL: [github.com/John-Varghese-EH/NoxPay](https://github.com/John-Varghese-EH/NoxPay)
