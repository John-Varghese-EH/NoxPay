# VoidPay — Project Plan

> Sovereign SaaS UPI & Crypto Payment Gateway · Powered by J0X

## Overview
VoidPay is a decoupled, multi-tenant payment infrastructure for UPI and USDT crypto, targeting the Indian market. It automates payment verification by monitoring bank email alerts and blockchain transactions in real-time.

## Architecture
- **Worker (`/worker`)**: Python 3.11 persistent service. IMAP IDLE for Gmail bank alerts + blockchain RPC polling. Verifies DKIM/SPF, parses amounts/UTRs, matches to intents, fires HMAC webhooks.
- **API (`/api`)**: FastAPI on Vercel. Creates payment intents (UPI deep-link URIs), status polling, client management, rate limiting.
- **Dashboard (`/dashboard`)**: Next.js 14 + Tailwind + Shadcn/UI. Ultra-dark theme. Real-time feed, analytics, API key management, webhook config.
- **Database**: Supabase PostgreSQL with RLS. 5 tables: `clients`, `payment_intents`, `verified_transactions`, `webhook_logs`, `audit_logs`.

## Execution Order
1. Initialize monorepo + setup.sh + Supabase schema SQL
2. Build Python Worker (critical security component first)
3. Build FastAPI backend
4. Build Next.js Dashboard
5. Integration testing

## Detailed Plan
See `implementation_plan.md` for full technical breakdown.
