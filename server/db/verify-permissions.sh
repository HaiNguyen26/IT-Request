#!/bin/bash

# Script kiểm tra quyền của user database
# Sử dụng: ./verify-permissions.sh [database_name] [user_name] [postgres_user]

set -e

DB_NAME="${1:-it_request_tracking}"
DB_USER="${2:-it_user}"
POSTGRES_USER="${3:-postgres}"

echo "=========================================="
echo "  Verify Database Permissions"
echo "=========================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Kiểm tra quyền trên các bảng chính
echo "Checking permissions on main tables..."
sudo -u $POSTGRES_USER psql -d $DB_NAME << EOF
-- Kiểm tra quyền trên schema
SELECT 
    has_schema_privilege('$DB_USER', 'public', 'USAGE') AS has_schema_usage,
    has_schema_privilege('$DB_USER', 'public', 'CREATE') AS has_schema_create;

-- Kiểm tra quyền trên các bảng
SELECT 
    tablename,
    has_table_privilege('$DB_USER', tablename, 'SELECT') AS can_select,
    has_table_privilege('$DB_USER', tablename, 'INSERT') AS can_insert,
    has_table_privilege('$DB_USER', tablename, 'UPDATE') AS can_update,
    has_table_privilege('$DB_USER', tablename, 'DELETE') AS can_delete
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Kiểm tra quyền trên sequences
SELECT 
    sequence_name,
    has_sequence_privilege('$DB_USER', sequence_name, 'USAGE') AS can_use
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;
EOF

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "If all permissions show 't' (true), user has correct permissions."
echo ""

