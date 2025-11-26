#!/bin/bash

# Script sửa management_accounts trên server: chỉ giữ lại 2 bản ghi
# Sử dụng: ./fix-management-accounts.sh [database_name] [user]

set -e

DB_NAME="${1:-it_request_tracking}"
DB_USER="${2:-postgres}"

echo "=========================================="
echo "  Fix Management Accounts"
echo "=========================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""
echo "This will:"
echo "  - DELETE all management_accounts"
echo "  - INSERT 2 correct accounts:"
echo "    1. IT Manager: nguyễn trung hải (Nguyễn Trung Hải)"
echo "    2. Leadership: lê thanh tùng (Lê Thanh Tùng)"
echo ""

read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Lấy đường dẫn script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/fix-management-accounts.sql"

# Chạy SQL
echo "Executing SQL script..."
sudo -u $DB_USER psql -d $DB_NAME -f "$SQL_FILE"

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "Management accounts have been fixed."
echo "Only 2 accounts remain: IT Manager and Leadership."
echo ""

