#!/usr/bin/env bash

# VoidPay Setup Script
# Generates .env files for local development

echo "+---------------------------------------------------+"
echo "|              VoidPay Environment Setup              |"
echo "+---------------------------------------------------+"
echo

# --- Supabase Credentials ---
read -p "Enter Supabase Database URL (Postgres): " SUPABASE_DB_URL
read -p "Enter Supabase API URL: " SUPABASE_API_URL
read -p "Enter Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
read -p "Enter Supabase Anon Key (for frontend): " SUPABASE_ANON_KEY

# --- Worker Credentials ---
read -p "Enter Bank Email Address (e.g. alerts@bank.com): " BANK_EMAIL
read -sp "Enter Bank Email App Password: " BANK_APP_PASSWORD
echo ""

# --- Security ---
# Generate a random JWT secret for local JWT signing (if needed)
JWT_SECRET=$(openssl rand -hex 32)
# Generate a random Master API key for dashboard backend ops
MASTER_API_KEY=$(openssl rand -hex 32)

echo
echo "=> Generating .env for /worker..."
cat <<EOF > worker/.env
# Supabase
SUPABASE_URL=$SUPABASE_API_URL
SUPABASE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Email (IMAP)
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993
IMAP_USER=$BANK_EMAIL
IMAP_PASSWORD=$BANK_APP_PASSWORD

# Blockchain Poller
USDT_WATCH_ADDRESS=
TRON_RPC_URL=https://api.trongrid.io
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Worker Config
POLL_INTERVAL=5
EOF
echo "worker/.env created."

echo "=> Generating .env for /api..."
cat <<EOF > api/.env
# Supabase
SUPABASE_URL=$SUPABASE_API_URL
SUPABASE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Security Config
JWT_SECRET=$JWT_SECRET
EOF
echo "api/.env created."

echo "=> Generating .env for /dashboard..."
cat <<EOF > dashboard/.env.local
# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Supabase (Server)
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Auth (Clerk or Supabase) - Update accordingly
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security Config
MASTER_API_KEY=$MASTER_API_KEY
EOF
echo "dashboard/.env.local created."

echo
echo "+---------------------------------------------------+"
echo "| Setup Complete! 🚀                                |"
echo "+---------------------------------------------------+"
echo "Run 'docker-compose up -d' if using local db, or 'npm run dev' in dashboard."
