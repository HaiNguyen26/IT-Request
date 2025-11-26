#!/bin/bash

# Script restore database PostgreSQL trên Ubuntu Server
# Sử dụng: ./restore-database.sh [backup_file] [database_name] [user]

set -e

BACKUP_FILE="${1:-it_request_tracking_backup.sql}"
DB_NAME="${2:-it_request_tracking}"
DB_USER="${3:-postgres}"

echo "=========================================="
echo "  Restore PostgreSQL Database"
echo "=========================================="
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Kiểm tra file backup có tồn tại không
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found!"
    echo ""
    echo "Please upload backup file first:"
    echo "  scp backup_file.sql root@27.71.16.15:/root/"
    exit 1
fi

# Kiểm tra database có tồn tại không
if ! sudo -u $DB_USER psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Database '$DB_NAME' does not exist. Creating..."
    sudo -u $DB_USER psql -c "CREATE DATABASE $DB_NAME;"
    echo "✓ Database created"
fi

# Xác nhận restore (sẽ ghi đè dữ liệu hiện có)
echo ""
echo "⚠️  WARNING: This will overwrite existing data in database '$DB_NAME'"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Drop và tạo lại database (để đảm bảo clean restore)
echo ""
echo "Dropping existing database..."
sudo -u $DB_USER psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
echo "✓ Database dropped"

echo "Creating new database..."
sudo -u $DB_USER psql -c "CREATE DATABASE $DB_NAME;"
echo "✓ Database created"

# Restore từ backup
echo ""
echo "Restoring from backup..."

# Kiểm tra và xử lý quyền file backup
if [ -f "$BACKUP_FILE" ]; then
    # Nếu file ở /root, copy sang /tmp (postgres không thể đọc /root)
    if [[ "$BACKUP_FILE" == /root/* ]]; then
        TEMP_FILE="/tmp/$(basename $BACKUP_FILE)"
        echo "Copying backup file to /tmp (postgres cannot read /root)..."
        cp "$BACKUP_FILE" "$TEMP_FILE"
        chmod 644 "$TEMP_FILE"
        sudo -u $DB_USER psql -d $DB_NAME -f "$TEMP_FILE"
        rm -f "$TEMP_FILE"
    else
        chmod 644 "$BACKUP_FILE"
        sudo -u $DB_USER psql -d $DB_NAME -f "$BACKUP_FILE"
    fi
else
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Kiểm tra restore
echo ""
echo "Verifying restore..."
RECORD_COUNT=$(sudo -u $DB_USER psql -d $DB_NAME -t -c "SELECT COUNT(*) FROM employees;" | xargs)

if [ "$RECORD_COUNT" -gt 0 ]; then
    echo "✓ Restore successful!"
    echo ""
    echo "Database statistics:"
    sudo -u $DB_USER psql -d $DB_NAME -c "
    SELECT 
        'employees' AS table_name, COUNT(*) AS count FROM employees
    UNION ALL
    SELECT 'service_requests', COUNT(*) FROM service_requests
    UNION ALL
    SELECT 'request_notes', COUNT(*) FROM request_notes
    UNION ALL
    SELECT 'management_accounts', COUNT(*) FROM management_accounts;
    "
else
    echo "⚠️  Warning: No employees found. Restore may have failed."
fi

echo ""
echo "=========================================="
echo "  Restore completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Update .env file with: DATABASE_URL=postgresql://$DB_USER:password@localhost:5432/$DB_NAME"
echo "  2. Restart application: pm2 restart it-request-api"
echo ""

