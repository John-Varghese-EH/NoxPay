# 🚀 NoxPay Deployment Guide: Free Hosting Alternatives

## ✅ Top 3 Free Alternatives

### 1. Oracle Cloud (Always Free) — ⭐ **Recommended**
Oracle offers the most powerful "Always Free" tier in the industry. You get a full Virtual Private Server (VPS) where you can run NoxPay exactly like you would on HidenCloud.

*   **Pros**: Full VPS control, generous RAM/CPU, 24/7 persistence.
*   **Cons**: Requires a credit card for identity verification (no charge), and sign-up can be picky about your location/details.
*   **Setup**: Use the `oracle_cloud_setup.sh` script provided in the root directory.

### 2. Koyeb (Free Nano Tier) — ⭐ **Best for Non-Card Users**
Koyeb is a modern PaaS that supports Docker and persistent services. Their "Nano" instance is free and doesn't sleep if it's a "Service" type.

*   **Pros**: No credit card required (usually), very easy to deploy (connect GitHub and go), supports auto-deployment on every git push.
*   **Cons**: Limited resources (512MB RAM), only one free app allowed.
*   **Setup**:
    1.  Create a Koyeb account and connect your GitHub repo.
    2.  Select **Web Service** (even for the worker).
    3.  Koyeb will automatically detect the **Dockerfile** I just added.
    4.  Add your `.env` variables (like `BANK_EMAIL`, `SUPABASE_URL`) in the **Environment Variables** section.
    5.  Set the **Instance Type** to `Nano`.
    6.  For the **Worker**, set the run command to `python worker/main.py`.
    7.  For the **API**, set the run command to `uvicorn api.main:app --host 0.0.0.0 --port 8000`.

### 3. Render (Web Only)

### 3. Firebase (Hosting Only) — ⚠️ **Partial Support**
Firebase is a robust platform, but because NoxPay is optimized for **Supabase Realtime**, you can only use Firebase for the **Frontend (Dashboard)** on the free plan.

*   **Pros**: Extremely fast global CDN, excellent free tier for static hosting.
*   **Cons**: No native support for the persistent Python Worker (Firebase Functions are for short-lived tasks only and require the "Blaze" paid plan for outbound requests).
*   **Suitability**: Only for the Dashboard. You still need **Oracle Cloud** or **Koyeb** for the API and Worker.
*   **Setup**:
    1.  Install Firebase CLI: `npm install -g firebase-tools`.
    2.  Run `firebase login` and `firebase init hosting`.
    3.  Select your project and set the public directory to `dashboard/out` (if using static export) or use Firebase App Hosting for Next.js.
    4.  **Note**: You must still point your `SUPABASE_URL` to your existing Supabase project, as Firebase Firestore is not a drop-in replacement for NoxPay's schema.

---

## 🛠️ How to Choose?

| Component | Recommended Platform | Why? |
| :--- | :--- | :--- |
| **Dashboard & API** | **Vercel** (Free) | Optimized for Next.js/FastAPI, best CDN, zero config. |
| **Worker** | **Oracle Cloud** or **Koyeb** | Supports always-on background processes. |
| **Database** | **Supabase** (Free) | Built-in Realtime support for checkout status updates. |

---

## 🚀 Quick Setup on any Ubuntu VPS

If you find *any* free Ubuntu VPS (Oracle, DigitalOcean free trial, AWS etc.), simply run:

```bash
# 1. Clone your repo onto the server
git clone <your-repo-url>
cd NoxPay

# 2. Run the setup script
chmod +x oracle_cloud_setup.sh
./oracle_cloud_setup.sh
```
