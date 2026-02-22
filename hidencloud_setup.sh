#!/bin/bash
set -e

echo "🚀 Setting up NoxPay Worker on HidenCloud..."

# 1. Update packages
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv coreutils

# 2. Create and activate virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# 3. Install requirements
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r worker/requirements.txt
pip install -r api/requirements.txt

# 4. Setup systemd service for persistence
echo "⚙️ Configuring systemd service..."

SERVICE_FILE="/etc/systemd/system/noxpay-worker.service"
CURRENT_DIR=$(pwd)
CURRENT_USER=$(whoami)

cat << EOF | sudo tee $SERVICE_FILE
[Unit]
Description=NoxPay Background Worker
After=network.target

[Service]
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$CURRENT_DIR/venv/bin/python worker/main.py
Restart=always
RestartSec=5
EnvironmentFile=$CURRENT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable noxpay-worker
sudo systemctl start noxpay-worker

echo "✅ HidenCloud Worker Setup Complete!"
echo "You can check the logs using: sudo journalctl -u noxpay-worker -f"
