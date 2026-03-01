# UPI Auto-Settlement

NoxPay's worker provides real-time settlement for UPI payments by monitoring your bank account's incoming SMS/email alerts via IMAP.

## 📡 How it Works

When a customer pays via the UPI QR code on the checkout page, they include a specific **Remark** (usually the Order ID). The NoxPay worker:
1.  Connects to your bank email (e.g., Gmail) via **IMAP IDLE**.
2.  Listens for new, unread emails from your bank's notification address.
3.  Parses the email body to extract the **Amount** and **UTR (Unique Transaction Reference)**.
4.  Matches the UTR or Order ID against pending payment intents in the database.
5.  Marks the transaction as `settled` and triggers your webhook.

## 🏦 Supported Banks

NoxPay includes built-in parsers for major Indian banks:
- **SBI (State Bank of India)**: Parses "Ref No" and "Rs." from UPI alerts.
- **HDFC Bank**: Parses "UPI Ref No" and "INR" from credit notifications.
- **Generic Parser**: A fallback parser that looks for "UPI" and "INR/Rs" keywords.

## 🔐 Security (DKIM Verification)

To prevent spoofing attacks (where someone sends a fake email to your worker), NoxPay includes **DKIM (DomainKeys Identified Mail)** verification.
- The worker verifies the cryptographic signature of the email to ensure it actually came from `@sbi.co.in` or `@hdfcbank.net`.
- Emails without valid DKIM signatures from trusted bank domains are automatically discarded.

## ⚙️ Configuration

You can configure your IMAP settings in the `.env` file or during the `setup.sh` process:
- `IMAP_SERVER`: e.g., `imap.gmail.com`
- `IMAP_PORT`: `993`
- `IMAP_USER`: Your email address.
- `IMAP_PASSWORD`: Your App Password (not your main account password).
