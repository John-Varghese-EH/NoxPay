# Checkout Experience

NoxPay provides a premium, responsive checkout UI designed to build trust and minimize friction for your customers.

## 🌐 Multi-Language Support

NoxPay is localized for a diverse user base, supporting:
- **English**: The professional standard for global business.
- **Hindi**: To provide a locally-tailored experience for Indian regional markets.

The user can toggle their preferred language directly on the checkout page. All instructions, payment status messages, and error alerts will update instantly.

## 🛒 Checkout Flow

1.  **Merchant Redirection**: The merchant's backend creates a Payment Intent and redirects the user to the `checkout_url`.
2.  **Payment Method Selection**: The user chooses between **UPI** (using a dynamic QR or VPA) or **Crypto** (USDT/SOL).
3.  **Live Verification**:
    *   For **UPI**: The screen displays a timer and waits for the Worker to signal the settlement from a bank email.
    *   For **Crypto**: The screen provides a "Check Status" button that verifies the blockchain transaction hash in real-time.
4.  **Success/Failure**: Once verified, the user is shown a success animation and redirected back to the merchant's `return_url`.

## 📱 Responsive Design

The checkout is built using **glassmorphic design** principles and is fully responsive. It looks stunning on mobile devices (optimized for UPI app switching) and desktop browsers.

## ⏳ Expiry Timers

Every payment intent has a configurable timeout (default 15 minutes). If the payment is not received within this window, the session expires to prevent stale transactions from being processed.
