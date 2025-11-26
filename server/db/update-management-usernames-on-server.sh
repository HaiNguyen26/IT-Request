#!/bin/bash
# Script cập nhật username từ trunghai/thanhtung sang tên đầy đủ trên server
# Sử dụng: ./update-management-usernames-on-server.sh [database_name] [user]

set -e

DATABASE_NAME="${1:-it_request_tracking}"
POSTGRES_USER="${2:-postgres}"

echo "=========================================="
echo "  Update Management Account Usernames"
echo "=========================================="
echo ""
echo "Database: $DATABASE_NAME"
echo "User: $POSTGRES_USER"
echo ""
echo "This will update:"
echo "  - IT Manager: trunghai -> nguyễn trung hải"
echo "  - Leadership: thanhtung -> lê thanh tùng"
echo ""

read -p "Are you sure? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Updating usernames..."

# Cập nhật username cho IT Manager
sudo -u postgres psql -d "$DATABASE_NAME" <<EOF
UPDATE management_accounts
SET username = 'nguyễn trung hải',
    updated_at = NOW()
WHERE username = 'trunghai' AND role = 'itManager';

UPDATE management_accounts
SET username = 'lê thanh tùng',
    updated_at = NOW()
WHERE username = 'thanhtung' AND role = 'leadership';

-- Kiểm tra kết quả
SELECT 
    role,
    username,
    display_name,
    email
FROM management_accounts
ORDER BY role;
EOF

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "Usernames have been updated."
echo ""

