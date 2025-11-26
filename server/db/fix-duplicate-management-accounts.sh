#!/bin/bash
# Script sửa lỗi duplicate management accounts trên server
# Xóa các bản ghi cũ (trunghai, thanhtung) và chỉ giữ lại bản ghi mới (tên đầy đủ)
# Sử dụng: ./fix-duplicate-management-accounts.sh [database_name] [user]

set -e

DATABASE_NAME="${1:-it_request_tracking}"
POSTGRES_USER="${2:-postgres}"

echo "=========================================="
echo "  Fix Duplicate Management Accounts"
echo "=========================================="
echo ""
echo "Database: $DATABASE_NAME"
echo "User: $POSTGRES_USER"
echo ""
echo "This will:"
echo "  - DELETE old accounts: trunghai, thanhtung"
echo "  - KEEP new accounts: nguyễn trung hải, lê thanh tùng"
echo ""

read -p "Are you sure? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Fixing duplicate accounts..."

# Xóa các bản ghi cũ và chỉ giữ lại bản ghi mới
sudo -u postgres psql -d "$DATABASE_NAME" <<EOF
-- Xóa bản ghi cũ của IT Manager (trunghai)
DELETE FROM management_accounts
WHERE username = 'trunghai' AND role = 'itManager';

-- Xóa bản ghi cũ của Leadership (thanhtung)
DELETE FROM management_accounts
WHERE username = 'thanhtung' AND role = 'leadership';

-- Đảm bảo chỉ có 2 bản ghi với username mới
-- Nếu chưa có, tạo mới
INSERT INTO management_accounts (role, username, password_hash, display_name, email, department)
VALUES
    ('itManager', 'nguyễn trung hải', '\$2a\$10\$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Nguyễn Trung Hải', 'nguyen.trung.hai@rmg123.com', 'IT Operations'),
    ('leadership', 'lê thanh tùng', '\$2a\$10\$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Lê Thanh Tùng', 'le.thanh.tung@rmg123.com', 'Điều hành')
ON CONFLICT (username) DO UPDATE
SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    updated_at = NOW();

-- Kiểm tra kết quả
SELECT 
    role,
    username,
    display_name,
    email
FROM management_accounts
ORDER BY role;

-- Đếm số lượng
SELECT COUNT(*) as total_accounts FROM management_accounts;
EOF

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "Duplicate accounts have been fixed."
echo "You should now have exactly 2 management accounts."
echo ""

