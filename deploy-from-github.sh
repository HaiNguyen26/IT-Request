#!/bin/bash

# Script deploy tự động từ GitHub
# Sử dụng: ./deploy-from-github.sh

set -e

PROJECT_DIR="/var/www/it-request-tracking"
SERVER_IP="27.71.16.15"

echo "=========================================="
echo "  Deploy from GitHub"
echo "=========================================="
echo ""

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd $PROJECT_DIR

# Backup uploads
echo -e "${YELLOW}[1/6] Backing up uploads...${NC}"
if [ -d "server/uploads" ]; then
    BACKUP_DIR="/tmp/uploads-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r server/uploads $BACKUP_DIR/ 2>/dev/null || true
    echo -e "${GREEN}✓ Uploads backed up to $BACKUP_DIR${NC}"
fi
echo ""

# Pull code mới
echo -e "${YELLOW}[2/6] Pulling latest code from GitHub...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Cài đặt dependencies
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
npm install
npm run postinstall
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build server
echo -e "${YELLOW}[4/6] Building server...${NC}"
cd server
npm run build
cd ..
echo -e "${GREEN}✓ Server built${NC}"
echo ""

# Build webapp
echo -e "${YELLOW}[5/6] Building webapp...${NC}"
cd webapp
export VITE_API_URL="http://${SERVER_IP}/api"
npm run build
cd ..
echo -e "${GREEN}✓ Webapp built${NC}"
echo ""

# Restart services
echo -e "${YELLOW}[6/6] Restarting services...${NC}"
pm2 restart it-request-api
systemctl reload nginx
echo -e "${GREEN}✓ Services restarted${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}Deployment completed!${NC}"
echo "=========================================="
echo ""
echo "Check status:"
echo "  pm2 status"
echo "  systemctl status nginx"
echo ""

