#!/bin/bash
# ==============================================================================
# NoxPay Universal VPS Setup Script (Ubuntu/Debian)
# Optimized for Oracle Cloud, DigitalOcean, AWS EC2, and more.
# ==============================================================================

set -e

echo "🌌 Starting NoxPay Worker Setup..."

# 1. Update and install base dependencies
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv coreutils curl iptables-persistent

# 2. Create Virtual Environment
if [ ! -d "venv" ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate

# 3. Install Requirements
echo "🚀 Installing dependencies..."
pip install --upgrade pip
pip install -r worker/requirements.txt
pip install -r api/requirements.txt

# 4. Handle Oracle Cloud Firewall (Common sticking point)
# Oracle Cloud VMs often have strict local iptables. This opens common ports.
if command -v iptables &> /dev/null; then
    echo "🛡️ Configuring local firewall (iptables)..."
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    # Note: You still need to open ports in the Oracle Cloud Console Security List!
fi

# 5. Create Systemd Service for Persistence
echo "⚙️ Creating noxpay-worker service..."

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

# 6. Start and Enable Service
echo "🔄 Reloading systemd and starting worker..."
sudo systemctl daemon-reload
sudo systemctl enable noxpay-worker
sudo systemctl restart noxpay-worker

echo ""
echo "✅ Setup Complete!"
echo "--------------------------------------------------------"
echo "🔍 Check Logs: sudo journalctl -u noxpay-worker -f"
echo "🛠️ Status:     sudo systemctl status noxpay-worker"
echo "--------------------------------------------------------"
echo "⚠️ IMPORTANT: If using Oracle Cloud, remember to open Port 8000"
echo "in both the 'Ingress Rules' of your VCN Security List AND the"
echo "matching 'Security List' for your subnet."
