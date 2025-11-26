#!/bin/bash

# Script cài đặt PostgreSQL trên Ubuntu
# Sử dụng: ./install-postgresql.sh

set -e

echo "=========================================="
echo "  Installing PostgreSQL"
echo "=========================================="
echo ""

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Kiểm tra PostgreSQL đã cài chưa
if command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL is already installed${NC}"
    psql --version
    echo ""
    read -p "Do you want to reinstall? (yes/no): " reinstall
    if [ "$reinstall" != "yes" ]; then
        echo "Exiting."
        exit 0
    fi
fi

# Cập nhật package list
echo -e "${YELLOW}[1/4] Updating package list...${NC}"
apt update
echo -e "${GREEN}✓ Updated${NC}"
echo ""

# Cài đặt PostgreSQL
echo -e "${YELLOW}[2/4] Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib
echo -e "${GREEN}✓ PostgreSQL installed${NC}"
echo ""

# Khởi động PostgreSQL
echo -e "${YELLOW}[3/4] Starting PostgreSQL service...${NC}"
systemctl start postgresql
systemctl enable postgresql
echo -e "${GREEN}✓ PostgreSQL started and enabled${NC}"
echo ""

# Kiểm tra trạng thái
echo -e "${YELLOW}[4/4] Checking PostgreSQL status...${NC}"
systemctl status postgresql --no-pager -l
echo ""

# Hiển thị thông tin
echo "=========================================="
echo -e "${GREEN}PostgreSQL installation completed!${NC}"
echo "=========================================="
echo ""
echo "PostgreSQL version:"
psql --version
echo ""
echo "Service status:"
systemctl is-active postgresql && echo -e "${GREEN}✓ Active${NC}" || echo -e "${RED}✗ Inactive${NC}"
echo ""
echo "Next steps:"
echo "  1. Create database: sudo -u postgres psql"
echo "  2. Create user and database (see DEPLOY_GITHUB.md)"
echo ""

