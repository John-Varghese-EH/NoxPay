# API Reference

NoxPay exposes a RESTful API for merchant integrations. All requests must be authenticated using `X-Client-ID` and `X-Client-Secret` headers.

## 💳 Payment Intents

### Create Payment Intent
`POST /api/v1/intents/`

Create a new payment session for a customer.

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "UPI",
  "order_id": "ORDER-123",
  "metadata": {
    "customer_id": "CUST-456",
    "cart_items": ["item1", "item2"]
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "pending",
  "upi_vpa": "merchant@bank",
  "checkout_url": "https://noxpay.io/checkout?intent=uuid"
}
```

## 📊 Analytics

### Get Performance Summary
`GET /api/v1/analytics/summary`

Fetch a summary of your payment volume and success rates.

**Query Parameters:**
- `days` (integer, default: 7): Number of days to look back.

**Response:**
```json
{
  "period_days": 7,
  "total_volume": 1500.25,
  "success_rate_percent": 98.5,
  "active_pending_intents": 12
}
```

## 🔔 Webhooks

### Test Webhook
`POST /api/v1/webhooks/test`

Sends a test payload to your configured `webhook_url`.

**Request Body:**
```json
{
  "event_type": "transaction.success",
  "custom_data": { "foo": "bar" }
}
```

---

[Github: John-Varghese-EH](https://github.com/John-Varghese-EH) | [Instagram: @cyber__trinity](https://www.instagram.com/cyber__trinity/)
Project URL: [github.com/John-Varghese-EH/NoxPay](https://github.com/John-Varghese-EH/NoxPay)
