---
slug: /api-reference
title: API Reference
sidebar_position: 1
---

# REST API Reference

The NoxPay API is built on **FastAPI** to provide high-concurrency, built-in validation via Pydantic, and strict JSON schemas.

The base URL for all API requests is the root path of the Python API container.

```text
http://127.0.0.1:8000/api/v1
```

---

## Authentication

NoxPay secures machine-to-machine interactions through cryptographic client secrets.

Every programmatic request must include two HTTP headers:

| Header Name | Type | Description |
| --- | --- | --- |
| X-Client-ID | UUID v4 | The unique public identifier of the merchant workspace. |
| X-Client-Secret | String | The secret key linked to your X-Client-ID. |

:::caution
**Client Secrets are strictly restricted to Backend Systems!** Never inject X-Client-Secret into a frontend app.
:::

---

## Payment Intents

### Create Payment Intent

Creates a new Payment Intent and returns the deposit parameters.

**Endpoint:** `POST /api/v1/intents/create-payment`

#### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| amount | Number | Yes | The transaction value. |
| currency | String | Yes | One of: UPI, USDT\_TRC20, USDT\_SOL, SOL. |
| order\_id | String | Yes | Your internal reference ID. |

#### Request Example

```json
{
  "amount": 99.50,
  "currency": "USDT_TRC20",
  "order_id": "INV_298418_XYZ"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "intent_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "amount": 99.50,
  "currency": "USDT_TRC20",
  "payment_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "status": "pending",
  "order_id": "INV_298418_XYZ",
  "created_at": "2023-11-20T14:32:00.000Z"
}
```

---

### Fetch Intent Status

Poll NoxPay to check if a transaction has settled.

**Endpoint:** `GET /api/v1/intents/:intent_id`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| intent\_id | UUID v4 | Yes | The ID from create-payment. |

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

## Standard Error Codes

| Error Code | HTTP Status | Description |
| --- | --- | --- |
| AUTH\_INVALID\_HEADERS | 401 | Missing X-Client-ID or X-Client-Secret. |
| AUTH\_INVALID\_SECRET | 403 | Validation failed on cryptographic mapping. |
| METHOD\_UNSUPPORTED | 400 | Unsupported currency requested. |
| INTENT\_NOT\_FOUND | 404 | The intent\_id does not exist. |

```json
{
  "detail": "Invalid authentication credentials."
}
```
