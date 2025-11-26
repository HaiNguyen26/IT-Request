#!/bin/bash

# Script cấp quyền đầy đủ và kiểm tra lại
# Sử dụng: ./fix-permissions-complete.sh [database_name] [user_name] [postgres_user]

set -e

DB_NAME="${1:-it_request_tracking}"
DB_USER="${2:-it_user}"
POSTGRES_USER="${3:-postgres}"

echo "=========================================="
echo "  Fix Database Permissions (Complete)"
echo "=========================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Postgres User: $POSTGRES_USER"
echo ""

read -p "This will grant all permissions to $DB_USER. Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Cấp quyền đầy đủ
echo "Granting all permissions..."
sudo -u $POSTGRES_USER psql -d $DB_NAME << EOF
-- Cấp quyền trên schema
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;

-- Cấp quyền trên tất cả các bảng
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;

-- Cấp quyền trên tất cả các sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Cấp quyền trên các types (enums)
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e'
    LOOP
        EXECUTE 'GRANT USAGE ON TYPE public.' || quote_ident(r.typname) || ' TO ' || quote_ident('$DB_USER');
    END LOOP;
END
\$\$;

-- Cấp quyền mặc định cho các bảng tương lai
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

-- Kiểm tra quyền trên management_accounts cụ thể
GRANT ALL PRIVILEGES ON TABLE management_accounts TO $DB_USER;
EOF

echo ""
echo "Verifying permissions..."
sudo -u $POSTGRES_USER psql -d $DB_NAME << EOF
-- Kiểm tra quyền trên management_accounts
SELECT 
    'management_accounts' AS table_name,
    has_table_privilege('$DB_USER', 'management_accounts', 'SELECT') AS can_select,
    has_table_privilege('$DB_USER', 'management_accounts', 'INSERT') AS can_insert,
    has_table_privilege('$DB_USER', 'management_accounts', 'UPDATE') AS can_update,
    has_table_privilege('$DB_USER', 'management_accounts', 'DELETE') AS can_delete;

-- Kiểm tra quyền trên schema
SELECT 
    has_schema_privilege('$DB_USER', 'public', 'USAGE') AS has_schema_usage,
    has_schema_privilege('$DB_USER', 'public', 'CREATE') AS has_schema_create;
EOF

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "All permissions have been granted. Please restart PM2:"
echo "  pm2 restart it-request-api"
echo ""

