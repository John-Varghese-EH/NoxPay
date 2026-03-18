# Bank Email Notification Setup Guide

This guide explains how to enable **real-time email alerts** for every transaction. This is required for the Payment Gateway to verify incoming funds automatically.

> **⚠️ Critical Requirement:** Set your "Transaction Threshold" to the lowest possible value (e.g., **₹1** or **$0.01**) to ensure every payment triggers an email.

---

## 🇮🇳 Indian Banks (UPI & IMPS)

### 1. Federal Bank
* **Portal:** FedNet (Net Banking)
* **Steps:** `General Services` > `Alerts` > `Modify Alerts`.
* **Action:** Select your account and check the **Email** box for all Credit/Debit types. Ensure the threshold is set to ₹1.

### 2. HDFC Bank (InstaAlerts)
* **Portal:** Net Banking
* **Steps:** Click `InstaAlerts` in the top right corner.
* **Action:** Choose your account. Under "Alert Type," select **Email** for "Debit/Credit above threshold."
* **Note:** Email alerts are free, whereas SMS alerts often carry a small fee.

### 3. State Bank of India (SBI)
* **Portal:** OnlineSBI (Net Banking)
* **Steps:** `Profile` > `Manage Alerts`.
* **Action:** First, verify your email in `Profile` > `Update Email ID`. Then, in Manage Alerts, toggle **Email** to "Active" for all transaction events.

### 4. ICICI Bank
* **Portal:** Internet Banking
* **Steps:** `Customer Service` > `Service Requests` > `Alerts` > `SMS/Email Alert Facility`.
* **Action:** Select your account and set the "Email Alert" status to **Enabled** for all transaction categories.

### 5. Axis Bank
* **Portal:** Internet Banking
* **Steps:** `Services` > `Alerts` > `Subscribe to Alerts`.
* **Action:** Select **Email** as the delivery channel and set the minimum transaction limit to ₹1.

---

## 🌎 International Banks

### 1. Chase (USA)
* **Portal:** chase.com or Mobile App
* **Steps:** `Profile & settings` > `Alerts` > `Choose alerts`.
* **Action:** Enable "Large transaction" alerts for both Debit and Credit. Change the amount to **$0.01** to capture all activity.

### 2. Bank of America (USA)
* **Portal:** Mobile App
* **Steps:** `Inbox (Envelope Icon)` > `Alerts` > `Settings` > `Account Activity`.
* **Action:** Select your account and toggle **Email Notifications** to ON for all transaction types.

### 3. Wells Fargo (USA)
* **Portal:** Online Banking
* **Steps:** `Account Services` > `Manage Alerts`.
* **Action:** Check the **Email** boxes for "Any transaction above $0.01."

---

## 🛡️ Developer Note: Verification Security

To prevent spoofing (fake emails), our gateway logic performs the following checks:
1. **SPF/DKIM/DMARC Validation:** The script verifies the email originated from the bank's official domain (e.g., `alerts@hdfcbank.net`).
2. **Recipient Matching:** The gateway checks that the email was sent to *your* registered email address, not a forwarded or BCC'd copy.
3. **Internal Parsing:** We verify the UTR/Transaction ID inside the email body against the bank's known template structure.

---