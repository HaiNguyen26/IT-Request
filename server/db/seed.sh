#!/bin/bash
# Script để chạy seed data vào PostgreSQL
# Usage: ./seed.sh [username] [database]

USER=${1:-postgres}
DB=${2:-it_request}
PASSWORD="Hainguyen261097"

echo "Đang chạy seed data cho database: $DB với user: $USER"
echo "Password: Hainguyen261097"

export PGPASSWORD=$PASSWORD
psql -U $USER -d $DB -f seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data đã được import thành công!"
else
    echo "❌ Có lỗi xảy ra khi import seed data"
    exit 1
fi



