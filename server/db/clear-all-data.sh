#!/bin/bash

# Script xóa toàn bộ dữ liệu, chỉ giữ lại employees và management_accounts
# Sử dụng: ./clear-all-data.sh [database_name] [user]

set -e

DB_NAME="${1:-it_request_tracking}"
DB_USER="${2:-postgres}"

echo "=========================================="
echo "  Clear All Data (Keep Employees)"
echo "=========================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""
echo "This will DELETE:"
echo "  - All service_requests"
echo "  - All request_notes"
echo "  - All note_attachments"
echo ""
echo "This will KEEP:"
echo "  - All employees"
echo "  - All management_accounts"
echo ""

read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Lấy đường dẫn script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/clear-all-data-keep-employees.sql"

# Chạy SQL
echo "Executing SQL script..."
sudo -u $DB_USER psql -d $DB_NAME -f "$SQL_FILE"

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "All service requests, notes, and attachments have been deleted."
echo "Employees and management accounts are preserved."
echo ""

