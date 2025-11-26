#!/bin/bash

# Script cấp quyền cho user database trên tất cả các bảng
# Sử dụng: ./grant-permissions.sh [database_name] [user_name] [postgres_user]

set -e

DB_NAME="${1:-it_request_tracking}"
DB_USER="${2:-it_user}"
POSTGRES_USER="${3:-postgres}"

echo "=========================================="
echo "  Grant Database Permissions"
echo "=========================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Postgres User: $POSTGRES_USER"
echo ""

# Cấp quyền trên schema public
echo "Granting permissions on schema public..."
sudo -u $POSTGRES_USER psql -d $DB_NAME << EOF
-- Cấp quyền sử dụng và tạo trong schema
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;

-- Cấp quyền trên tất cả các bảng hiện có
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;

-- Cấp quyền trên tất cả các sequences (cho auto-increment)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Cấp quyền trên các types (enums) - QUAN TRỌNG
GRANT USAGE ON TYPE request_priority TO $DB_USER;
GRANT USAGE ON TYPE request_status TO $DB_USER;
GRANT USAGE ON TYPE note_visibility TO $DB_USER;
GRANT USAGE ON TYPE note_type TO $DB_USER;
GRANT USAGE ON TYPE management_role TO $DB_USER;

-- Cấp quyền mặc định cho các bảng tương lai
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

-- Đảm bảo user có quyền owner trên database (nếu cần)
-- ALTER DATABASE $DB_NAME OWNER TO $DB_USER;

-- Kiểm tra quyền đã cấp
SELECT 
    'Schema permissions' AS check_type,
    has_schema_privilege('$DB_USER', 'public', 'USAGE') AS has_usage,
    has_schema_privilege('$DB_USER', 'public', 'CREATE') AS has_create;

SELECT 
    'Table permissions' AS check_type,
    tablename,
    has_table_privilege('$DB_USER', tablename, 'SELECT') AS can_select,
    has_table_privilege('$DB_USER', tablename, 'INSERT') AS can_insert,
    has_table_privilege('$DB_USER', tablename, 'UPDATE') AS can_update,
    has_table_privilege('$DB_USER', tablename, 'DELETE') AS can_delete
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
EOF

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "Permissions have been granted to user '$DB_USER' on database '$DB_NAME'."
echo ""

