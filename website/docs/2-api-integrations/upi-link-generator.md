---
sidebar_position: 4
title: UPI Payment Link Generator
description: Create free, shareable UPI payment links and QR codes with NoxPay. No API key or account required.
keywords: [UPI, payment link, QR code, free, VPA, UPI ID, Google Pay, PhonePe, Paytm, BHIM, link generator]
---

# UPI Payment Link Generator

NoxPay includes a **free, public UPI payment link generator** that anyone can use — no account, no API key, no signup required. Create shareable UPI payment links and QR codes instantly.

🔗 **Try it now:** [nox-pay.vercel.app/upi](https://nox-pay.vercel.app/upi)

---

## Overview

The UPI Link Generator is a fully client-side tool that:

- Creates shareable links for receiving UPI payments
- Generates scannable QR codes
- Supports custom amounts and payment notes
- Works with **all UPI apps** (Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, etc.)
- **Stores zero data** — everything is encoded in the URL

:::info No Backend Required
This tool is entirely stateless. No data is saved to any database or server. The payment information lives in the URL itself. When you close the page, nothing is retained.
:::

---

## How It Works

### 1. Create a Link

Visit [`/upi`](https://nox-pay.vercel.app/upi) and fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **VPA / UPI ID** | ✅ Yes | Your UPI Virtual Payment Address (e.g., `name@okaxis`, `name@ybl`) |
| **Amount (₹)** | ❌ Optional | Payment amount in INR. If omitted, the payer chooses the amount. |
| **Note** | ❌ Optional | A short description for the payment (e.g., "Coffee payment") |

Click **Generate Link** to create your shareable URL and QR code.

### 2. Share the Link

Once generated, you get:
- A **copyable URL** — paste it in WhatsApp, SMS, email, or anywhere
- A **QR code** — screenshot or share it directly
- A **Share button** — uses the device's native share dialog (mobile)

### 3. Recipient Opens the Link

When someone opens the payment link (`/upi/pay?pa=...`), they see:
- A large scannable **QR code** (for desktop users)
- An **"Open UPI App"** button (for mobile — launches their UPI app directly)
- Payment details: payee VPA, amount, and note

---

## URL Parameters

### Creator Page (`/upi`)

You can pre-fill the form by passing URL parameters:

```
https://nox-pay.vercel.app/upi?vpa=name@okaxis&amount=100&note=Coffee
```

| Parameter | Alias | Description |
|-----------|-------|-------------|
| `vpa` | `pa` | VPA / UPI ID to pre-fill |
| `amount` | `am` | Amount to pre-fill |
| `note` | `tn` | Note to pre-fill |

### Payment Page (`/upi/pay`)

The generated payment page uses these parameters:

```
https://nox-pay.vercel.app/upi/pay?pa=name@okaxis&am=100&tn=Coffee
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `pa` | ✅ Yes | Payee VPA (UPI ID) |
| `am` | ❌ Optional | Amount in INR |
| `tn` | ❌ Optional | Transaction note |

### UPI Deep Link

The payment page internally constructs a standard UPI deep link:

```
upi://pay?pa=name@okaxis&pn=NoxPay&am=100.0&tn=Coffee&cu=INR
```

This is the [NPCI-standard UPI deep link format](https://www.npci.org.in/what-we-do/upi/product-overview) that all UPI apps support.

---

## Examples

### Basic — VPA only

```
https://nox-pay.vercel.app/upi/pay?pa=name@okaxis
```

Payer will choose their own amount.

### With Amount

```
https://nox-pay.vercel.app/upi/pay?pa=name@okaxis&am=499
```

Pre-sets ₹499 as the payment amount.

### With Amount + Note

```
https://nox-pay.vercel.app/upi/pay?pa=name@okaxis&am=199.50&tn=Monthly+Subscription
```

Pre-sets ₹199.50 and adds a note "Monthly Subscription".

### Pre-filled Creator (for embedding)

```html
<a href="https://nox-pay.vercel.app/upi?vpa=your-upi@ybl&amount=100&note=Donate">
  Pay ₹100 via UPI
</a>
```

---

## Use Cases

| Use Case | Example |
|----------|---------|
| **Freelancers** | Send payment links to clients after completing work |
| **Small businesses** | Create QR codes for in-store payments |
| **Online sellers** | Share payment links on social media |
| **Event organizers** | Collect entry fees or donations |
| **Content creators** | Accept tips and support from followers |
| **Friends & family** | Split bills and collect money easily |

---

## Security & Privacy

- 🔒 **Zero data storage** — nothing is saved to any server or database
- 🔓 **Open source** — verify the code yourself on [GitHub](https://github.com/John-Varghese-EH/NoxPay)
- 🚫 **No tracking** — no analytics, no cookies, no user tracking
- 📡 **Client-side only** — all processing happens in your browser
- 🔗 **URL is the data** — all payment info lives in the URL parameters

:::warning Disclaimer
NoxPay does not process any payments. The generated links simply open the user's existing UPI app with pre-filled details. The actual payment processing is done by the NPCI/UPI network and the respective banking apps. NoxPay has no visibility into or control over any transactions.
:::

---

## Integration with Your Website

You can create UPI payment links programmatically without using the NoxPay API:

```javascript
function createUpiLink(vpa, amount, note) {
  const params = new URLSearchParams({ pa: vpa });
  if (amount) params.set('am', amount.toString());
  if (note) params.set('tn', note);
  return `https://nox-pay.vercel.app/upi/pay?${params.toString()}`;
}

// Usage
const link = createUpiLink('merchant@okaxis', 499, 'Order #123');
// → https://nox-pay.vercel.app/upi/pay?pa=merchant@okaxis&am=499&tn=Order+%23123
```

Or construct the raw UPI deep link directly (no NoxPay dependency):

```javascript
function createUpiDeepLink(vpa, amount, note) {
  let link = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=YourApp&cu=INR`;
  if (amount) link += `&am=${amount}`;
  if (note) link += `&tn=${encodeURIComponent(note)}`;
  return link;
}
```
