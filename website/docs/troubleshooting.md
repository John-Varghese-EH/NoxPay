# Troubleshooting Guide

This guide covers common issues you might encounter while setting up or running NoxPay.

## 🚀 API Issues

### 429 Too Many Requests
- **Cause**: You have exceeded your merchant's rate limit (default 100 RPM).
- **Solution**: Implement exponential backoff in your integration. Check the `Retry-After` header for the number of seconds to wait. You can request a limit increase in the Merchant Dashboard.

### 403 Forbidden
- **Cause**: Invalid API Key (`X-Client-Secret`) or the IP address is not whitelisted.
- **Solution**: Verify your keys in the Dashboard. Ensure your server's outgoing IP is added to the "IP Whitelisting" section.

### 400 Bad Request (Invalid Order ID)
- **Cause**: Order IDs must be alphanumeric and cannot exceed 64 characters.
- **Solution**: Ensure your internal Order IDs only contain letters, numbers, hyphens (`-`), or underscores (`_`).

## 📧 Worker & UPI Issues

### IMAP Connection Failed
- **Cause**: Incorrect credentials or firewall blocking port 993.
- **Solution**: 
    - Use an **App Password** if you use Gmail/Outlook.
    - Ensure your server can reach `imap.gmail.com:993`.
    - Check if "Less Secure Apps" or "IMAP Access" is enabled in your email settings.

### Payments Not Settling
- **Cause**: Email format has changed or the Order ID/Remark was missing in the UPI transfer.
- **Solution**:
    - Check the worker logs: `docker logs noxpay-worker`.
    - Ensure the customer included the correct **Remark** provided on the checkout page.

## 🔗 Database (Supabase) Issues

### 500 Internal Server Error (Database not configured)
- **Cause**: `SUPABASE_URL` or `SUPABASE_KEY` missing from `.env`.
- **Solution**: Run `setup.sh` again or manually verify your environment variables.

### Webhooks Not Delivering
- **Cause**: Incorrect Webhook URL or your listener is returning a non-2xx status code.
- **Solution**:
    - Check the "Webhook Logs" in the Dashboard.
    - NoxPay will retry failed webhooks up to 10 times with increasing delays.
