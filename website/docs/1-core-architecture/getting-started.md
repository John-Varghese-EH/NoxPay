---
slug: /getting-started
---

# Getting Started

This guide will help you set up NoxPay for local development and prepare it for production.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or later
- **Python**: v3.9 or later
- **Supabase Account**: A free project for database and auth
- **Git**: To clone the repository

## 🛠️ Step 1: Local Development Setup

Clone the repository and run the setup script:

```bash
git clone https://github.com/John-Varghese-EH/NoxPay.git
cd NoxPay
bash setup.sh
```

The `setup.sh` script will:
1. Create a Python virtual environment.
2. Install dependencies for the API and Worker.
3. Prompt you for Supabase credentials and IMAP settings.
4. Generate `.env` files for each component.

## 🚀 Step 2: Running the Services

Open three separate terminals to run each component:

### Main API (FastAPI)
```bash
cd api
uvicorn main:app --reload
```

### Dashboard (Next.js)
```bash
cd dashboard
npm install
npm run dev
```

### Worker (Python)
```bash
# Ensure venv is active
source venv/bin/bin/activate # Windows: venv\Scripts\activate
python -m worker.main
```

## 🏗️ Step 3: Deployment

### Platform (Dashboard & API)
NoxPay is optimized for **Vercel**. Simply push your code to a GitHub repository and connect it to Vercel. Ensure you provide all environment variables in the Vercel dashboard.

### Worker (IMAP & Blockchain)
The worker requires a persistent environment. We recommend a **VPS** (e.g., DigitalOcean, Hetzner) or a long-running container.

---

[Github: John-Varghese-EH](https://github.com/John-Varghese-EH) | [Instagram: @cyber__trinity](https://www.instagram.com/cyber__trinity/)
Project URL: [github.com/John-Varghese-EH/NoxPay](https://github.com/John-Varghese-EH/NoxPay)
