---
slug: /api-reference
title: API Reference
sidebar_position: 1
---

# 📡 REST API Reference

The NoxPay API is built fundamentally on **FastAPI** to provide extreme high-concurrency, built-in structural validation via Pydantic, and strict JSON schemas. The API allows you to programmatically generate payment intents and verify their security mechanisms right from your server environment.

The base URL for all API requests to the NoxPay instance is the root path of the Python API container.

`ash
# Example Local URL
http://127.0.0.1:8000/api/v1
```

---

## Authentication

NoxPay secures machine-to-machine interactions through cryptographic client secrets. When you create a merchant account, the dashboard automatically provisions an API credential set.

Every programmatic request you make must include two specific HTTP headers:

| Header Name | Type | Description |
| ---- | --- | --- |
| X-Client-ID | UUID v4 | The unique public identifier of the merchant workspace. |
| X-Client-Secret | String | The deeply randomized secret key linked directly to your X-Client-ID. |

`ash
# Example Authentication Headers
curl -X GET "https://api.yournoxpay.com/api/v1/health" \
  -H "X-Client-ID: 7a3c31b3-..." \
  -H "X-Client-Secret: sk_live_83b2..."
```

> **CAUTION:**
> **Client Secrets are strictly restricted to Backend Systems!** You must never inject X-Client-Secret directly into an overarching frontend app (like React, Angular, or Vue). All NoxPay Intent creation requests must route securely through your own backend server.

---

## 🚀 Payment Intents

Payment Intents are the foundational element of NoxPay's checkout lifecycle. An intent tracks a payment from its initial conception all the way through to final blockchain/bank settlement.

### Create Payment Intent

Creates a new Payment Intent and returns the exact deposit parameters or checkout url mapping required for the user to finalize the payment.

**Endpoint:** POST /api/v1/intents/create-payment

#### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| mount | Number | Yes | The absolute nominal numerical value for the transaction (e.g., 499.00). |
| currency | String | Yes | The requested target processor. Must be exactly one of: "UPI", "USDT_TRC20", "USDT_SOL", "SOL". |
| order_id | String | Yes | Your internal backend reference ID (e.g., a Database invoice PK). Used natively within NoxPay to align your webhooks. |

#### Request Example

```json
{
  "amount": 99.50,
  "currency": "USDT_TRC20",
  "order_id": "INV_298418_XYZ"
}
```

#### Response (200 OK)

The response provides the unique identifier NoxPay uses for tracking, as well as the target deposit entity (a UPI VPA or Crypto Wallet Address).

```json
{
  "success": true,
  "intent_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "client_id": "7a3c31b3-...",
  "amount": 99.50,
  "currency": "USDT_TRC20",
  "payment_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "status": "pending",
  "order_id": "INV_298418_XYZ",
  "checkout_url": "https://noxpay.com/checkout/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "created_at": "2023-11-20T14:32:00.000Z"
}
```

---

### Fetch Intent Status

Often you need to silently poll NoxPay to discover if a transaction has settled securely.

**Endpoint:** GET /api/v1/intents/\{intent_id\}

#### URL Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| intent_id | UUID v4 | Yes | The ID generated exclusively by /create-payment. |

#### Response (200 OK)

```json
{
  "intent_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "amount": 99.50,
  "currency": "USDT_TRC20",
  "status": "settled",
  "transaction_hash": "25a589255a298bf6fbe1e28bc0da0a631c15...",
  "verified_at": "2023-11-20T14:35:12.000Z"
}
```

---

## 🚫 Standard Error Codes

NoxPay attempts to parse input intelligently and will decline syntactically flawed connections proactively using rigorous HTTP 400 logic.

| Error Code | HTTP Status | Description |
| --- | --- | --- |
| AUTH_INVALID_HEADERS | 401 | Missing X-Client-ID or X-Client-Secret. |
| AUTH_INVALID_SECRET | 403 | Validation failed on the cryptographic mapping of ID to Key. |
| METHOD_UNSUPPORTED | 400 | The currency explicitly requested falls outside global accepted parameters. |
| INTENT_NOT_FOUND | 404 | The /intents/\{intent_id\} route received a ghost UUID. |

```json
{
  "detail": "Invalid authentication credentials. X-Client-ID and X-Client-Secret mismatch."
}
```
"@

 = @"
---
slug: /webhook_verification
title: Webhook Verification
sidebar_position: 3
---

# 🔗 Webhook Verification

Webhooks allow NoxPay to push real-time transaction updates directly to your Application server. Since anyone can theoretically shoot a POST request at an open URL, it is critically important to verify that the webhook was genuinely triggered by NoxPay. 

We solve this using **HMAC-SHA256 Signatures**.

---

## The Signature Header

When a webhook is deployed from the NoxPay worker daemon, it attaches a custom header containing the cryptographic hash:

X-NoxPay-Signature

### The Hashing Mechanism
1. The NoxPay system retrieves your X-Client-Secret.
2. NoxPay computes an HMAC-SHA256 composite from the **raw JSON payload body**.
3. It hex-encodes the hash and attaches it to the request header.

You must emulate this exact same cryptographic process on your backend to prove the payload is pristine and originated from us.

---

## Implementation Guides

### Node.js / Express Example

To correctly generate signatures in JavaScript, you must ensure the framework gives you access to the **raw, unparsed request buffer**. (Use express.raw({type: 'application/json'})).

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

const CLIENT_SECRET = process.env.NOXPAY_CLIENT_SECRET;

app.post('/noxpay-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const payload = req.body;
  const signatureHeader = req.headers['x-noxpay-signature'];
  
  // 1. Generate HMAC-SHA256 hash using the Raw payload
  const expectedHash = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(payload)
    .digest('hex');
    
  // 2. Prevent Timing Attacks via Constant-Time comparison
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedHash)
    );
    
    if (!isValid) return res.status(401).send("Invalid Signature");
  } catch(e) {
    return res.status(401).send("Malformed Signature String");
  }

  // 3. Process the event if valid
  const event = JSON.parse(payload.toString());
  
  if (event.event_type === "payment.success") {
    console.log(Order  was paid successfully!);
    // Deliver Digital Goods, Top-Up Credits, etc.
  }
  
  res.status(200).send("Webhook Processed");
});
```

### Python / FastAPI Example

```python
import hmac
import hashlib
from fastapi import FastAPI, Request, HTTPException, Header

app = FastAPI()
CLIENT_SECRET = "sk_live_83b2..."

@app.post("/noxpay-webhook")
async def handle_noxpay_webhook(
    request: Request,
    x_noxpay_signature: str = Header(...)
):
    # 1. Yield the raw body byte string from ASGI
    raw_payload = await request.body()
    
    # 2. Re-compute HMAC-SHA256
    expected_hash = hmac.new(
        CLIENT_SECRET.encode('utf-8'),
        raw_payload,
        hashlib.sha256
    ).hexdigest()
    
    # 3. Secure Constant-Time comparison
    if not hmac.compare_digest(expected_hash, x_noxpay_signature):
        raise HTTPException(status_code=401, detail="Invalid HMAC Signature")
        
    # 4. Success Execution
    event = await request.json()
    if event.get("event_type") == "payment.success":
        print(f"Verified Deposit Match: {event.get('order_id')}")
    
    return {"status": "success"}
```

---

## The Payload Structure

Once verified, the parsed JSON body will follow this exact schema for all payment.success alerts.

```json
{
  "event_type": "payment.success",
  "intent_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "amount": 99.50,
  "currency": "USDT_TRC20",
  "order_id": "INV_298418_XYZ",
  "transaction_hash": "25a589255a298bf6fbe1e28bc0da0a631c15...",
  "verified_at": "2023-11-20T14:35:12.000Z"
}
```

> **IMPORTANT:**
> NoxPay requires your endpoint to return a 200 series HTTP status code within 10 seconds. If a webhook times out, or your server returns a 500 error, the NoxPay queue will execute an Exponential Backoff protocol and retry the delivery a maximum of 5 times over 48 hours.