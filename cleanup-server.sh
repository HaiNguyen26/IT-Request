#!/bin/bash

# Script xóa code trên server (giữ lại database)
# Sử dụng: ./cleanup-server.sh

set -e

PROJECT_DIR="/var/www/it-request-tracking"

echo "=========================================="
echo "  Cleaning up server code"
echo "=========================================="
echo ""
echo "This will remove all code from: $PROJECT_DIR"
echo "Database will NOT be affected"
echo ""

read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Dừng PM2 process
echo "[1/4] Stopping PM2 process..."
pm2 delete it-request-api 2>/dev/null || echo "No PM2 process found"
pm2 save
echo "✓ PM2 stopped"
echo ""

# Xóa Nginx config
echo "[2/4] Removing Nginx configuration..."
rm -f /etc/nginx/sites-enabled/it-request-tracking
rm -f /etc/nginx/sites-available/it-request-tracking
systemctl reload nginx
echo "✓ Nginx config removed"
echo ""

# Xóa thư mục dự án (giữ lại uploads nếu cần)
echo "[3/4] Removing project directory..."
if [ -d "$PROJECT_DIR" ]; then
    # Backup uploads nếu cần
    if [ -d "$PROJECT_DIR/server/uploads" ]; then
        echo "Backing up uploads directory..."
        mkdir -p /tmp/it-request-backup
        cp -r "$PROJECT_DIR/server/uploads" /tmp/it-request-backup/ 2>/dev/null || true
        echo "Uploads backed up to /tmp/it-request-backup/uploads"
    fi
    
    rm -rf "$PROJECT_DIR"
    echo "✓ Project directory removed"
else
    echo "Project directory not found"
fi
echo ""

# Xóa PM2 logs
echo "[4/4] Cleaning PM2 logs..."
rm -f /var/log/pm2/it-api-*.log
echo "✓ Logs cleaned"
echo ""

echo "=========================================="
echo "  Cleanup completed!"
echo "=========================================="
echo ""
echo "Note: Database is still intact"
echo "Uploads backup (if any): /tmp/it-request-backup/uploads"
echo ""

