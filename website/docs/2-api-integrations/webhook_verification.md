---
slug: /webhook_verification
title: Webhook Verification
sidebar_position: 3
---

# Webhook Verification

Webhooks allow NoxPay to push real-time transaction updates directly to your server.
Verify that the webhook was genuinely triggered by NoxPay using **HMAC-SHA256 Signatures**.

---

## The Signature Header

NoxPay attaches `X-NoxPay-Signature` to every webhook request.

### The Hashing Mechanism

1. NoxPay retrieves your Webhook Secret.
2. It computes an HMAC-SHA256 hash from the **raw JSON payload body**.
3. It hex-encodes the hash and attaches it to the request header.

---

## Implementation Guides

### Node.js / Express

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();
const WEBHOOK_SECRET = process.env.NOXPAY_WEBHOOK_SECRET;

app.post('/noxpay-webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const payload = req.body;
    const sig = req.headers['x-noxpay-signature'];
    const expected = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(sig), Buffer.from(expected)
      );
      if (!isValid) return res.status(401).send('Invalid Signature');
    } catch (e) {
      return res.status(401).send('Malformed Signature');
    }
    const event = JSON.parse(payload.toString());
    res.status(200).send('OK');
  }
);
```

### Python / FastAPI

```python
import hmac
import hashlib
from fastapi import FastAPI, Request, HTTPException, Header

app = FastAPI()
WEBHOOK_SECRET = "whsec_..."

@app.post("/noxpay-webhook")
async def handle_webhook(
    request: Request,
    x_noxpay_signature: str = Header(...)
):
    raw_payload = await request.body()
    expected = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        raw_payload,
        hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, x_noxpay_signature):
        raise HTTPException(status_code=401, detail="Invalid Signature")
    event = await request.json()
    return {"status": "success"}
```

---

## The Payload Structure

All `payment.success` webhooks follow this schema:

```json
{
  "event_type": "payment.success",
  "intent_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "amount": 99.50,
  "currency": "USDT_TRC20",
  "order_id": "INV_298418_XYZ",
  "transaction_hash": "25a589255a298bf6...",
  "verified_at": "2023-11-20T14:35:12.000Z"
}
```

:::important
NoxPay requires your endpoint to return a 200-series HTTP status within 10 seconds. Failed deliveries are retried up to 5 times over 48 hours.
:::
