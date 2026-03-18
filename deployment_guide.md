# 🚀 NoxPay Deployment Guide: Free Hosting Alternatives

## ⚠️ InfinityFree — NOT Compatible

> [!WARNING]
> **InfinityFree only supports PHP.** NoxPay uses Python (FastAPI) for the API, Python for the worker, and Next.js for the dashboard. InfinityFree **cannot** run any of these. Do not use it.

---

## ✅ Top Free Alternatives (Ranked)

### 1. Render (Free Tier) — ⭐ **Best Overall**
Render is the most popular Heroku replacement with a generous free tier that supports Python, Node.js, and Docker natively.

*   **Pros**: No credit card required, auto-deploy from GitHub, built-in SSL, supports background workers and web services, easy environment variable management.
*   **Cons**: Free web services spin down after 15 min of inactivity (cold starts ~30s). Free tier limited to 750 hours/month.
*   **Setup**:
    1.  Create a [Render](https://render.com) account and connect your GitHub repo.
    2.  **For the API**: Create a **Web Service** → set build command to `pip install -r api/requirements.txt` → set start command to `uvicorn api.main:app --host 0.0.0.0 --port $PORT`.
    3.  **For the Worker**: Create a **Background Worker** → set build command to `pip install -r worker/requirements.txt` → set start command to `python worker/main.py`.
    4.  Add your `.env` variables (`BANK_EMAIL`, `SUPABASE_URL`, etc.) in **Environment** settings.
    5.  Deploy!

---

### 2. Koyeb (Free Nano Tier) — ⭐ **Best for Always-On**
Koyeb is a modern PaaS that supports Docker and persistent services. Their "Nano" instance is free and **doesn't sleep** if it's a "Service" type.

*   **Pros**: No credit card required (usually), auto-deploy from GitHub, no sleep/cold starts on Service type, supports Docker.
*   **Cons**: Limited resources (512MB RAM), only one free app allowed.
*   **Setup**:
    1.  Create a [Koyeb](https://koyeb.com) account and connect your GitHub repo.
    2.  Select **Web Service** (even for the worker).
    3.  Koyeb will automatically detect the **Dockerfile**.
    4.  Add your `.env` variables (`BANK_EMAIL`, `SUPABASE_URL`) in the **Environment Variables** section.
    5.  Set the **Instance Type** to `Nano`.
    6.  For the **Worker**, set the run command to `python worker/main.py`.
    7.  For the **API**, set the run command to `uvicorn api.main:app --host 0.0.0.0 --port 8000`.

---

### 3. Oracle Cloud (Always Free) — ⭐ **Most Powerful**
Oracle offers the most powerful "Always Free" tier in the industry. You get a full Virtual Private Server (VPS) where you can run NoxPay with full control.

*   **Pros**: Full VPS control, generous RAM/CPU (1GB RAM, 2 OCPUs), 24/7 persistence, no sleep/cold starts.
*   **Cons**: **Requires a credit card** for identity verification (no charge), sign-up can be picky about location/details.
*   **Setup**: Use the `oracle_cloud_setup.sh` script provided in the root directory.

---

### 4. Fly.io (Free Tier) — Great for Docker
Fly.io runs Docker containers on edge servers worldwide with a generous free allowance.

*   **Pros**: 3 shared-CPU VMs free, 160GB outbound bandwidth, persistent volumes, global edge deployment.
*   **Cons**: Requires credit card for verification (no charge on free tier). CLI-based setup.
*   **Setup**:
    1.  Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/).
    2.  Run `fly auth signup` → `fly launch` in the project root.
    3.  Fly will auto-detect the **Dockerfile**.
    4.  Set secrets: `fly secrets set BANK_EMAIL=... SUPABASE_URL=...`
    5.  Deploy with `fly deploy`.

---

### 5. Leapcell — **Best Serverless Free**
Leapcell is designed for small Python projects with a generous serverless free tier.

*   **Pros**: Up to 20 free services, no credit card required, serverless (scale to zero), supports FastAPI natively.
*   **Cons**: Newer platform (less community support), serverless means cold starts.
*   **Setup**:
    1.  Create a [Leapcell](https://leapcell.io) account.
    2.  Connect your GitHub repo and select the API directory.
    3.  Set the start command to `uvicorn api.main:app --host 0.0.0.0 --port $PORT`.
    4.  Add environment variables and deploy.

---

### 6. PythonAnywhere — **Simplest for Python**
The easiest platform to get a Python web app running. Great for beginners.

*   **Pros**: No credit card, browser-based terminal, one-click Python hosting.
*   **Cons**: Only 1 free web app, 512MB disk, no background tasks on free tier (worker won't work here), limited outbound HTTP on free tier.
*   **Best for**: Hosting only the **API** (not the worker).

---

## 🛠️ How to Choose?

| Component | Recommended Platform | Why? |
| :--- | :--- | :--- |
| **Dashboard** | **Vercel** (Free) | Optimized for Next.js, best CDN, zero config. |
| **API** | **Render** or **Koyeb** (Free) | Supports Python/FastAPI, easy GitHub deploy. |
| **Worker** | **Render**, **Koyeb**, or **Oracle Cloud** | Supports always-on background processes. |
| **Database** | **Supabase** (Free) | Built-in Realtime support for checkout updates. |

### Quick Comparison

| Platform | Credit Card? | Sleep/Cold Start? | RAM (Free) | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Render** | ❌ No | ⚠️ Yes (15 min) | 512MB | API + Worker |
| **Koyeb** | ❌ No | ✅ No sleep | 512MB | Always-on services |
| **Oracle Cloud** | ⚠️ Yes (verify) | ✅ No sleep | 1GB | Full VPS control |
| **Fly.io** | ⚠️ Yes (verify) | ✅ No sleep | 256MB x3 | Docker containers |
| **Leapcell** | ❌ No | ⚠️ Serverless | Varies | Serverless API |
| **PythonAnywhere** | ❌ No | ✅ No sleep | 512MB disk | API only |

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
