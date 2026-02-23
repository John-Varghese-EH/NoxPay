# NoxPay

**Sovereign SaaS UPI & Crypto Payment Gateway** — By J0X

![NoxPay Logo](./dashboard/public/icon.svg)

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJohn-Varghese-EH%2FNoxPay)

### 1. Dashboard & API (Vercel)
**Note: You only need ONE Vercel project for NoxPay.** 
Because this repository contains a `vercel.json` file, Vercel will automatically route requests under `/api/*` to the Python FastAPI backend, and all other routes directly to the Next.js Dashboard. No separate backend deployment is needed!

Click the **Deploy** button above to provision the full platform to Vercel instantly. You will be prompted to provide your Supabase credentials.

### 2. Worker (HidenCloud or VM)
Use the included setup script to provision the background worker on your Ubuntu/Debian persistent server:

```bash
chmod +x hidencloud_setup.sh
./hidencloud_setup.sh
```

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Dashboard  │────▶│   FastAPI    │────▶│   Supabase   │
│   (Next.js)  │     │   Backend    │     │   (Postgres) │
└──────────────┘     └──────────────┘     └──────────────┘
                           │                      ▲
                           │                      │
                     ┌─────▼──────┐               │
                     │   Worker   │───────────────┘
                     │  (Python)  │
                     └────────────┘
```

## Security Layer

- **CORS lockdown** — API only accepts requests from configured origins (`ALLOWED_ORIGINS`)
- **DKIM/SPF verification** — worker validates email authenticity before processing
- **HMAC-SHA256 webhooks** — signed with a dedicated `webhook_secret` (not the API key hash)
- **Replay protection** — `X-NoxPay-Timestamp` header included in webhook signatures
- **bcrypt API secrets** — client secrets are hashed with bcrypt; never stored in plaintext
- **Rate limiting** — per-client configurable limits with `Retry-After` headers
- **Row-Level Security** — Supabase RLS policies isolate merchant data
- **Request tracing** — all requests tagged with `X-Request-ID` for audit

---

## Configuration & Customization

### Backend API (`/api/.env`)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `MASTER_API_KEY` | **Required.** Secret key for dashboard → API admin calls |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins (default: `http://localhost:3000`) |

### Background Worker (`/worker/.env`)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `IMAP_SERVER` | IMAP server address (e.g., `imap.gmail.com`) |
| `IMAP_USER` | Bank alert email address |
| `IMAP_PASSWORD` | App password for IMAP access |

### Frontend Dashboard (`/dashboard/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for client-side auth |

---

## Integration Guide

### 1. Create a Payment Intent

```bash
curl -X POST https://your-api.vercel.app/api/v1/intents/create-payment \
  -H "Content-Type: application/json" \
  -H "X-Client-ID: YOUR_CLIENT_ID" \
  -H "X-Client-Secret: YOUR_CLIENT_SECRET" \
  -d '{
    "amount": 500.00,
    "currency": "UPI",
    "order_id": "ORDER_12345"
  }'
```

**Response:**
```json
{
  "id": "uuid",
  "order_id": "ORDER_12345",
  "amount": 500.00,
  "status": "pending",
  "payment_uri": "upi://pay?pa=merchant%40sbi&...",
  "qr_code_base64": "iVBORw0KGgo...",
  "expires_at": "2026-02-22T20:15:00"
}
```

### 2. Display QR Code
```html
<img src="data:image/png;base64,{qr_code_base64}" alt="Pay with UPI" />
```

### 3. Verify Webhook Signature

When NoxPay sends a webhook to your `webhook_url`, verify the signature:

```python
import hmac, hashlib

def verify_noxpay_webhook(webhook_secret, timestamp, payload_bytes, received_signature):
    signing_input = f"{timestamp}.".encode() + payload_bytes
    expected = hmac.new(webhook_secret.encode(), signing_input, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received_signature)

# In your webhook handler:
timestamp = request.headers["X-NoxPay-Timestamp"]
signature = request.headers["X-NoxPay-Signature"]
is_valid = verify_noxpay_webhook(WEBHOOK_SECRET, timestamp, request.body, signature)
```

### Customizing the UPI Transaction Note

The `tn` parameter in UPI intents defaults to:
`NOXPAY-<order_id>-source-website/custom-dev-fixed-note`

Modify the `tn_value` variable in `api/utils/upi.py` to customize.

---

## Running Tests

```bash
# API + Worker tests
$env:PYTHONPATH="."; .\venv\Scripts\pytest api worker -v

# Dashboard build check
cd dashboard && npm run build
```

### Author
[John-Varghese-EH](https://github.com/John-Varghese-EH)
