# Hướng dẫn Triển khai Hoàn chỉnh - IT Request Tracking

## Repository: https://github.com/HaiNguyen26/IT-Request.git
## Server: 27.71.16.15 (Ubuntu)

---

## Tổng quan

Hướng dẫn này sẽ:
1. ✅ Xóa dữ liệu cũ trên server (service_requests, request_notes) - chỉ giữ employees
2. ✅ Backup database từ máy local Windows
3. ✅ Upload backup lên server
4. ✅ Restore database trên server
5. ✅ Deploy ứng dụng

---

## Bước 1: Xóa Dữ liệu Cũ trên Server (Nếu cần)

### 1.1. Xóa service_requests và request_notes (Giữ lại employees)

**Nếu database đã có dữ liệu cũ và bạn muốn xóa để bắt đầu lại:**

```bash
# SSH vào server
ssh root@27.71.16.15

# Vào thư mục db
cd /var/www/it-request-tracking/server/db

# Chạy script xóa (chỉ xóa requests, giữ lại employees)
chmod +x clear-requests-on-server.sh
./clear-requests-on-server.sh it_request_tracking postgres
```

**Hoặc chạy SQL trực tiếp:**
```bash
sudo -u postgres psql -d it_request_tracking << 'EOF'
DELETE FROM note_attachments;
DELETE FROM request_notes;
DELETE FROM service_requests;
SELECT 'service_requests' AS table_name, COUNT(*) AS count FROM service_requests
UNION ALL SELECT 'request_notes', COUNT(*) FROM request_notes
UNION ALL SELECT 'note_attachments', COUNT(*) FROM note_attachments
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'management_accounts', COUNT(*) FROM management_accounts;
EOF
```

**Lưu ý:** 
- ✅ **GIỮ LẠI**: employees, management_accounts
- ❌ **XÓA**: service_requests, request_notes, note_attachments

### 1.2. Sửa management_accounts (Nếu có 4 thay vì 2)

**Nếu `management_accounts` có 4 bản ghi thay vì 2:**

```bash
# SSH vào server
ssh root@27.71.16.15

# Vào thư mục db
cd /var/www/it-request-tracking/server/db

# Chạy script sửa (xóa tất cả, chèn lại 2 bản ghi đúng)
chmod +x fix-management-accounts.sh
./fix-management-accounts.sh it_request_tracking postgres
```

**Hoặc chạy SQL trực tiếp:**
```bash
sudo -u postgres psql -d it_request_tracking << 'EOF'
DELETE FROM management_accounts;
INSERT INTO management_accounts (role, username, password_hash, display_name, email, department)
VALUES
    ('itManager', 'trunghai', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Nguyễn Trung Hải', 'nguyen.trung.hai@rmg123.com', 'IT Operations'),
    ('leadership', 'thanhtung', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Lê Thanh Tùng', 'le.thanh.tung@rmg123.com', 'Điều hành');
SELECT role, username, display_name FROM management_accounts ORDER BY role;
EOF
```

**Kết quả:** Chỉ còn 2 bản ghi:
- ✅ IT Manager: `trunghai` (Nguyễn Trung Hải)
- ✅ Leadership: `thanhtung` (Lê Thanh Tùng)

---

## Bước 1: Xóa Database Cũ trên Server (Nếu tạo database mới)

### 1.1. SSH vào server

```bash
ssh root@27.71.16.15
```

### 1.2. Kiểm tra và xóa database cũ

```bash
# Kiểm tra PostgreSQL có đang chạy không
systemctl status postgresql

# Kiểm tra database có tồn tại không
sudo -u postgres psql -l | grep it_request_tracking
```

**Nếu database đã tồn tại (như trường hợp của bạn - lỗi "database already exists"):**

**Lựa chọn 1: Xóa ngay bây giờ (Khuyến nghị)**
```bash
# Xóa database cũ (sẽ mất dữ liệu cũ)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS it_request_tracking;"
```

**Lựa chọn 2: Để script restore tự động xóa (Ở bước 5)**
```bash
# Bỏ qua bước này, script restore-database.sh sẽ tự động drop và tạo lại database
# Tiếp tục sang Bước 2: Backup database từ local
```

**Lưu ý:** 
- Script `restore-database.sh` sẽ tự động **DROP và tạo lại database** khi restore
- Nên xóa database cũ trước để tránh lỗi "database already exists" khi tạo mới

---

## Bước 2: Backup Database từ Máy Local Windows

### 2.1. Kiểm tra tên database

```powershell
# Mở PowerShell trong thư mục dự án
cd "D:\IT- Request tracking\server\db"

# Kiểm tra database có tồn tại không
.\check-database.ps1

# Hoặc kiểm tra thủ công
$env:PGPASSWORD = "Hainguyen261097"
psql -U postgres -l
$env:PGPASSWORD = ""
```

**Tên database phổ biến:**
- `it_request` (mặc định trên local)
- `it_request_tracking` (trên server)

### 2.2. Kiểm tra tên database trước

```powershell
# Kiểm tra database có tồn tại không
psql -U postgres -l
```

**Lưu ý:** Tên database trên máy local có thể là `it_request` (không phải `it_request_tracking`)

### 2.3. Chạy script backup

**Cách 1: Sử dụng PowerShell script (Khuyến nghị)**
```powershell
# Nếu database tên là "it_request" (mặc định)
.\backup-database.ps1

# Hoặc chỉ định tên database cụ thể
.\backup-database.ps1 -DatabaseName "it_request"
```

**Cách 2: Sử dụng Batch script**
```cmd
backup-database.bat
```

**Cách 3: Chạy thủ công**
```powershell
# Set password
$env:PGPASSWORD = "Hainguyen261097"
$env:PGCLIENTENCODING = "UTF8"

# Backup (thay "it_request" bằng tên database thực tế của bạn)
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
pg_dump -U postgres -d it_request -F p -f "it_request_tracking_backup_$timestamp.sql" --verbose

# Clear password
$env:PGPASSWORD = ""
```

**Lưu ý:** 
- Tên database mặc định trên local: `it_request`
- Trên server sẽ restore thành: `it_request_tracking`

**File backup sẽ được tạo:** `it_request_tracking_backup_YYYYMMDD_HHMMSS.sql`

**Ví dụ:** `it_request_tracking_backup_20251126_153443.sql`

### 2.3. Kiểm tra file backup

```powershell
# Kiểm tra file đã tạo
Get-ChildItem "it_request_tracking_backup_*.sql" | Select-Object Name, Length, LastWriteTime
```

---

## Bước 3: Upload Backup lên Server

### 3.1. Kiểm tra file backup trên máy local

**Trước khi upload, kiểm tra file backup đã tạo:**
```powershell
# Mở PowerShell trong thư mục db
cd "D:\IT- Request tracking\server\db"

# Kiểm tra file backup (tên file: it_request_tracking_backup_*.sql)
Get-ChildItem "it_request_tracking_backup_*.sql" | Select-Object Name, Length, LastWriteTime
```

**Nếu chưa có file backup, chạy script backup trước:**
```powershell
.\backup-database.ps1
```

### 3.2. Upload file backup lên server

**Từ máy local Windows (PowerShell):**
```powershell
# Upload file backup (thay tên file thực tế)
# Ví dụ: it_request_tracking_backup_20251126_153443.sql
scp "D:\IT- Request tracking\server\db\it_request_tracking_backup_20251126_153443.sql" root@27.71.16.15:/root/
```

**Hoặc upload tất cả file backup:**
```powershell
scp "D:\IT- Request tracking\server\db\it_request_tracking_backup_*.sql" root@27.71.16.15:/root/
```

**Lưu ý:** 
- File backup từ local có tên: `it_request_tracking_backup_YYYYMMDD_HHMMSS.sql`
- Ví dụ: `it_request_tracking_backup_20251126_153443.sql`
- Thay `YYYYMMDD_HHMMSS` bằng timestamp thực tế của file bạn vừa tạo
- Sau khi upload, kiểm tra lại trên server: `ls -lh /root/it_request_tracking_backup_*.sql`

---

## Bước 4: Cài đặt PostgreSQL trên Server

### 4.1. SSH vào server

```bash
ssh root@27.71.16.15
```

### 4.2. Cài đặt PostgreSQL

```bash
# Cập nhật package list
apt update

# Cài đặt PostgreSQL
apt install -y postgresql postgresql-contrib

# Khởi động và enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Kiểm tra trạng thái
systemctl status postgresql
```

### 4.3. Tạo database mới

**Kiểm tra database đã tồn tại chưa:**
```bash
# Kiểm tra database
sudo -u postgres psql -l | grep it_request_tracking
```

**Nếu database chưa tồn tại, tạo mới:**
```bash
# Tạo database
sudo -u postgres psql -c "CREATE DATABASE it_request_tracking;"
```

**Nếu database đã tồn tại:**
```bash
# Xóa database cũ và tạo lại (sẽ mất dữ liệu cũ)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS it_request_tracking;"
sudo -u postgres psql -c "CREATE DATABASE it_request_tracking;"
```

**Lưu ý:** 
- Cảnh báo "could not change directory to /root: Permission denied" là bình thường, không ảnh hưởng
- Database đã được tạo thành công nếu thấy "CREATE DATABASE"
- Nếu muốn giữ lại database cũ, bỏ qua bước này (script restore sẽ tự động xóa và tạo lại)

**Tạo user (tùy chọn - có thể dùng postgres):**
```bash
# Tạo user mới (nếu chưa có)
sudo -u postgres psql -c "CREATE USER it_user WITH PASSWORD 'your_secure_password';" 2>/dev/null || echo "User already exists"

# Cấp quyền trên database
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE it_request_tracking TO it_user;"
```

**QUAN TRỌNG: Cấp quyền trên các bảng (sau khi restore database):**

```bash
# Vào thư mục db
cd /var/www/it-request-tracking/server/db

# Chạy script cấp quyền
chmod +x grant-permissions.sh
./grant-permissions.sh it_request_tracking it_user postgres
```

**Hoặc cấp quyền thủ công:**
```bash
sudo -u postgres psql -d it_request_tracking << 'EOF'
-- Cấp quyền sử dụng schema
GRANT USAGE ON SCHEMA public TO it_user;

-- Cấp quyền trên tất cả các bảng
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO it_user;

-- Cấp quyền trên tất cả các sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO it_user;

-- Cấp quyền trên các types (enums)
GRANT USAGE ON TYPE request_priority TO it_user;
GRANT USAGE ON TYPE request_status TO it_user;
GRANT USAGE ON TYPE note_visibility TO it_user;
GRANT USAGE ON TYPE note_type TO it_user;
GRANT USAGE ON TYPE management_role TO it_user;

-- Cấp quyền mặc định cho các bảng tương lai
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO it_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO it_user;
EOF
```

**Lưu ý:** 
- Nếu dùng user `postgres` thay vì `it_user`, không cần cấp quyền (postgres có quyền đầy đủ)
- Nếu gặp lỗi `permission denied for table management_accounts`, chạy script cấp quyền trên

---

## Bước 5: Restore Database trên Server

### 5.1. Kiểm tra file backup đã upload

```bash
# SSH vào server
ssh root@27.71.16.15

# Kiểm tra file backup (tên file: it_request_tracking_backup_*.sql)
ls -lh /root/it_request_tracking_backup_*.sql

# Nếu không tìm thấy, kiểm tra tất cả file .sql
ls -lh /root/*.sql

# Hoặc kiểm tra tất cả files trong /root
ls -lh /root/
```

**Nếu file chưa có, quay lại Bước 3 để upload file backup.**

**Ví dụ tên file:** `it_request_tracking_backup_20251126_153443.sql`

**Xóa file backup cũ (nếu cần):**
```bash
# Xóa file backup cụ thể
rm /root/it_request_tracking_backup_20251126_152326.sql

# Hoặc xóa tất cả file backup cũ (cẩn thận)
# rm /root/it_request_tracking_backup_*.sql
```

### 5.2. Restore database

**Cách 1: Sử dụng script tự động (Khuyến nghị)**

**Nếu file `restore-database.sh` chưa có, tạo nó trước:**

```bash
# Tạo file restore-database.sh trực tiếp trên server
cat > /var/www/it-request-tracking/server/db/restore-database.sh << 'EOF'
#!/bin/bash
set -e
BACKUP_FILE="${1:-it_request_tracking_backup.sql}"
DB_NAME="${2:-it_request_tracking}"
DB_USER="${3:-postgres}"
echo "Restore Database: $BACKUP_FILE -> $DB_NAME"
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi
read -p "Overwrite database? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then exit 0; fi
sudo -u $DB_USER psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u $DB_USER psql -c "CREATE DATABASE $DB_NAME;"
sudo -u $DB_USER psql -d $DB_NAME -f "$BACKUP_FILE"
echo "✓ Restore completed!"
EOF

chmod +x /var/www/it-request-tracking/server/db/restore-database.sh
```

**Sau đó chạy restore:**

```bash
# Vào thư mục db
cd /var/www/it-request-tracking/server/db

# Chạy script restore (thay tên file thực tế)
# Ví dụ: it_request_tracking_backup_20251126_153443.sql
./restore-database.sh /root/it_request_tracking_backup_20251126_153443.sql
```

**Lưu ý:** 
- Script sẽ tự động **DROP và tạo lại database** (xóa dữ liệu cũ)
- File backup từ local có tên: `it_request_tracking_backup_YYYYMMDD_HHMMSS.sql`
- Ví dụ: `it_request_tracking_backup_20251126_153443.sql`

**Cách 2: Restore thủ công**

**Lưu ý:** User `postgres` không thể đọc file trong `/root/`, cần copy file sang thư mục khác hoặc sửa quyền:

```bash
# Drop database cũ (nếu đã tồn tại)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS it_request_tracking;"

# Tạo database mới
sudo -u postgres psql -c "CREATE DATABASE it_request_tracking;"

# Copy file backup sang thư mục tạm (postgres có thể đọc)
cp /root/it_request_tracking_backup_20251126_153443.sql /tmp/restore.sql
chmod 644 /tmp/restore.sql

# Restore từ file trong /tmp
sudo -u postgres psql -d it_request_tracking -f /tmp/restore.sql

# Xóa file tạm
rm /tmp/restore.sql
```

**Hoặc sửa quyền file trong /root (ít an toàn hơn):**
```bash
# Sửa quyền file
chmod 644 /root/it_request_tracking_backup_20251126_153443.sql

# Restore (có thể vẫn lỗi vì postgres không có quyền vào /root)
sudo -u postgres psql -d it_request_tracking -f /root/it_request_tracking_backup_20251126_153443.sql
```

**Lưu ý:** Tên file backup từ local là `it_request_tracking_backup_YYYYMMDD_HHMMSS.sql`

**Cách 3: Restore với drop database (clean restore) - Đã được script tự động làm**

Script `restore-database.sh` đã tự động drop và tạo lại database, không cần làm thủ công.

### 5.3. Cấp quyền cho user database (QUAN TRỌNG)

**Nếu dùng user `it_user` (không phải `postgres`), cần cấp quyền sau khi restore:**

**Nếu gặp lỗi khi pull (có thay đổi local):**
```bash
cd /var/www/it-request-tracking

# Xem thay đổi local
git status

# Stash thay đổi local (tạm thời lưu lại)
git stash

# Pull code mới
git pull origin main

# Hoặc nếu muốn bỏ thay đổi local và dùng code từ GitHub:
# git reset --hard origin/main
```

**Sau đó chạy script cấp quyền:**
```bash
# Vào thư mục db
cd /var/www/it-request-tracking/server/db

# Chạy script cấp quyền đầy đủ (script mới)
chmod +x fix-permissions-complete.sh
./fix-permissions-complete.sh it_request_tracking it_user postgres
```

**Hoặc dùng script cấp quyền cơ bản:**
```bash
chmod +x grant-permissions.sh
./grant-permissions.sh it_request_tracking it_user postgres
```

**Hoặc cấp quyền thủ công:**
```bash
sudo -u postgres psql -d it_request_tracking << 'EOF'
GRANT USAGE ON SCHEMA public TO it_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO it_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO it_user;
GRANT USAGE ON TYPE request_priority TO it_user;
GRANT USAGE ON TYPE request_status TO it_user;
GRANT USAGE ON TYPE note_visibility TO it_user;
GRANT USAGE ON TYPE note_type TO it_user;
GRANT USAGE ON TYPE management_role TO it_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO it_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO it_user;
EOF
```

**Lưu ý:** Nếu dùng user `postgres`, bỏ qua bước này (postgres có quyền đầy đủ).

### 5.3.1. Kiểm tra quyền đã cấp (tùy chọn)

**Nếu muốn xác nhận quyền đã được cấp đúng:**

```bash
cd /var/www/it-request-tracking/server/db

# Chạy script kiểm tra quyền
chmod +x verify-permissions.sh
./verify-permissions.sh it_request_tracking it_user postgres
```

**Hoặc kiểm tra thủ công:**
```bash
sudo -u postgres psql -d it_request_tracking -c "
SELECT 
    tablename,
    has_table_privilege('it_user', tablename, 'SELECT') AS can_select,
    has_table_privilege('it_user', tablename, 'INSERT') AS can_insert,
    has_table_privilege('it_user', tablename, 'UPDATE') AS can_update
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"
```

**Kết quả mong đợi:** Tất cả các bảng phải có `can_select`, `can_insert`, `can_update` = `t` (true).

### 5.4. Kiểm tra restore

```bash
# Kiểm tra số lượng records
sudo -u postgres psql -d it_request_tracking -c "
SELECT 
    'employees' AS table_name, COUNT(*) AS count FROM employees
UNION ALL
SELECT 'service_requests', COUNT(*) FROM service_requests
UNION ALL
SELECT 'request_notes', COUNT(*) FROM request_notes
UNION ALL
SELECT 'management_accounts', COUNT(*) FROM management_accounts;
"
```

**Kết quả mong đợi:**
- `employees`: > 0 (danh sách nhân viên)
- `service_requests`: 0 hoặc có dữ liệu (tùy backup)
- `request_notes`: 0 hoặc có dữ liệu (tùy backup)
- `management_accounts`: 2 (IT Manager và Leadership)

---

## Bước 6: Clone Code từ GitHub

### 6.1. Cài đặt Git (nếu chưa có)

```bash
apt install -y git
```

### 6.2. Clone repository

```bash
# Tạo thư mục và clone
mkdir -p /var/www
cd /var/www

# Nếu thư mục đã tồn tại, xóa trước
if [ -d "it-request-tracking" ]; then
    rm -rf it-request-tracking
fi

# Clone repository
git clone https://github.com/HaiNguyen26/IT-Request.git it-request-tracking
cd it-request-tracking
```

---

## Bước 7: Cài đặt Dependencies

### 7.1. Cài đặt Node.js (nếu chưa có)

```bash
# Cài đặt Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Kiểm tra version
node --version
npm --version
```

### 7.2. Cài đặt PM2

```bash
npm install -g pm2
```

### 7.3. Cài đặt dependencies dự án

```bash
cd /var/www/it-request-tracking

# Cài đặt dependencies
npm install
npm run postinstall
```

**Lưu ý:** Nếu gặp cảnh báo `npm audit`, có thể bỏ qua (chỉ là cảnh báo bảo mật).

---

## Bước 8: Cấu hình Environment Variables

### 8.1. Tạo file .env

```bash
cd /var/www/it-request-tracking/server
nano .env
```

### 8.2. Nội dung file .env

**Nếu dùng user `postgres`:**
```env
PORT=4000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/it_request_tracking
NODE_ENV=production
```

**Nếu dùng user `it_user`:**
```env
PORT=4000
DATABASE_URL=postgresql://it_user:your_secure_password@localhost:5432/it_request_tracking
NODE_ENV=production
```

**Lưu ý:** 
- Thay `your_password` hoặc `your_secure_password` bằng mật khẩu thực tế
- Nếu user `postgres` chưa có password, cần set:
  ```bash
  sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'new_password';"
  ```

---

## Bước 9: Build Production

### 9.1. Build server

```bash
cd /var/www/it-request-tracking/server
npm run build
```

### 9.2. Build webapp

```bash
cd /var/www/it-request-tracking/webapp

# Nếu có domain (ví dụ: it-request.rmg123.com)
export VITE_API_URL=http://it-request.rmg123.com/api
# Hoặc nếu dùng HTTPS:
# export VITE_API_URL=https://it-request.rmg123.com/api

# Nếu chỉ dùng IP
# export VITE_API_URL=http://27.71.16.15/api

npm run build
```

**Lưu ý:** 
- Thay `it-request.rmg123.com` bằng domain thực tế của bạn
- Nếu dùng HTTPS, đổi `http://` thành `https://`

---

## Bước 10: Tạo thư mục uploads

```bash
mkdir -p /var/www/it-request-tracking/server/uploads
chmod 755 /var/www/it-request-tracking/server/uploads
```

---

## Bước 11: Cấu hình PM2

### 11.1. Tạo file ecosystem.config.js (nếu chưa có)

File `ecosystem.config.js` đã có sẵn trong repository. **QUAN TRỌNG:** Cần cập nhật `DATABASE_URL` với thông tin database thực tế.

**Kiểm tra và cập nhật DATABASE_URL:**

```bash
cd /var/www/it-request-tracking

# Kiểm tra file ecosystem.config.js
cat ecosystem.config.js

# Sửa file ecosystem.config.js (thay 'your_password' bằng password thực tế)
nano ecosystem.config.js
```

**File `ecosystem.config.js` cần có `DATABASE_URL` trong phần `env`:**

```javascript
module.exports = {
  apps: [{
    name: 'it-request-api',
    script: './server/dist/index.js',
    cwd: '/var/www/it-request-tracking',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      DATABASE_URL: 'postgres://it_user:your_secure_password@localhost:5432/it_request_tracking'
    },
    error_file: '/var/log/pm2/it-api-error.log',
    out_file: '/var/log/pm2/it-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads']
  }]
}
```

**Lưu ý:** 
- Thay `your_secure_password` bằng password thực tế của user `it_user` (đã tạo ở Bước 4.3)
- Nếu dùng user `postgres` thay vì `it_user`, sửa thành: `postgres://postgres:your_password@localhost:5432/it_request_tracking`

### 11.2. Tạo thư mục log

```bash
mkdir -p /var/log/pm2
```

### 11.3. Khởi động PM2

**Trước khi khởi động, đảm bảo:**
1. ✅ Server đã được build: `cd server && npm run build`
2. ✅ `DATABASE_URL` đã được cập nhật trong `ecosystem.config.js`
3. ✅ Database đã được tạo và restore

```bash
cd /var/www/it-request-tracking

# Xóa process cũ (nếu có)
pm2 delete it-request-api 2>/dev/null || true

# Khởi động PM2
pm2 start ecosystem.config.js

# Lưu cấu hình
pm2 save

# Thiết lập auto-start khi reboot
pm2 startup
```

**Nếu có lỗi, kiểm tra logs:**
```bash
pm2 logs it-request-api --lines 50
```

### 11.4. Kiểm tra PM2

```bash
pm2 status
pm2 logs it-request-api
```

---

## Bước 12: Cấu hình Domain Name (Tùy chọn)

### 12.1. Cấu hình DNS

**Nếu bạn đã có domain (ví dụ: `it-request.rmg123.com`):**

1. **Thêm A record trong DNS:**
   - **Type:** A
   - **Name:** `it-request` (hoặc `@` nếu dùng root domain)
   - **Value:** `27.71.16.15`
   - **TTL:** 3600 (hoặc mặc định)

2. **Chờ DNS propagate** (thường 5-30 phút, có thể lên đến 24h)

3. **Kiểm tra DNS:**
   ```bash
   nslookup it-request.rmg123.com
   # Hoặc
   dig it-request.rmg123.com
   ```

**Nếu chưa có domain, bạn có thể:**
- Mua domain từ nhà cung cấp (GoDaddy, Namecheap, v.v.)
- Hoặc dùng subdomain miễn phí (nếu có)
- Hoặc tiếp tục dùng IP `27.71.16.15`

---

## Bước 12: Cấu hình Nginx

### 12.1. Cài đặt Nginx (nếu chưa có)

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### 12.2. Tạo file cấu hình Nginx

**Nếu có domain (ví dụ: `it-request.rmg123.com`):**
```bash
cat > /etc/nginx/sites-available/it-request-tracking << 'EOF'
server {
    listen 80;
    server_name it-request.rmg123.com 27.71.16.15;
EOF
```

**Nếu chỉ dùng IP:**
```bash
cat > /etc/nginx/sites-available/it-request-tracking << 'EOF'
server {
    listen 80;
    server_name 27.71.16.15;

    access_log /var/log/nginx/it-request-access.log;
    error_log /var/log/nginx/it-request-error.log;

    root /var/www/it-request-tracking/webapp/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/uploads {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF
```

### 12.3. Enable site

```bash
# Enable site
ln -s /etc/nginx/sites-available/it-request-tracking /etc/nginx/sites-enabled/

# Xóa default site (nếu không cần)
rm -f /etc/nginx/sites-enabled/default

# Test cấu hình
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Bước 13: Cấu hình Firewall

```bash
# Mở các port cần thiết
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (nếu có SSL)

# Enable firewall
ufw enable

# Kiểm tra
ufw status
```

---

## Bước 14: Kiểm tra và Test

### 14.1. Kiểm tra PM2

```bash
pm2 status
pm2 logs it-request-api --lines 50
```

### 14.2. Kiểm tra Nginx

```bash
systemctl status nginx
tail -f /var/log/nginx/it-request-error.log
```

### 14.3. Test API

```bash
# Test từ server
curl http://localhost:4000/health
curl http://27.71.16.15/api/health
```

### 14.4. Test Web

Mở trình duyệt và truy cập: **http://27.71.16.15**

---

## Cập nhật Code (Deploy mới)

Khi có code mới trên GitHub:

```bash
# SSH vào server
ssh root@27.71.16.15

cd /var/www/it-request-tracking

# Backup uploads (nếu cần)
cp -r server/uploads /tmp/uploads-backup-$(date +%Y%m%d)

# Pull code mới
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install
npm run postinstall

# Build lại
cd server && npm run build && cd ..
cd webapp && export VITE_API_URL=http://27.71.16.15/api && npm run build && cd ..

# Restart PM2
pm2 restart it-request-api

# Reload Nginx
systemctl reload nginx
```

---

## Lệnh Quản lý Thường dùng

### PM2
```bash
pm2 status                    # Xem trạng thái
pm2 logs it-request-api      # Xem logs
pm2 restart it-request-api   # Restart
pm2 stop it-request-api      # Dừng
pm2 delete it-request-api    # Xóa
```

### Nginx
```bash
systemctl status nginx       # Trạng thái
systemctl restart nginx      # Restart
systemctl reload nginx       # Reload config
nginx -t                     # Test config
```

### PostgreSQL
```bash
systemctl status postgresql  # Trạng thái
systemctl restart postgresql # Restart
sudo -u postgres psql -d it_request_tracking -c "SELECT COUNT(*) FROM employees;"  # Test
```

### Logs
```bash
# PM2 logs
pm2 logs it-request-api --lines 100

# Nginx logs
tail -f /var/log/nginx/it-request-access.log
tail -f /var/log/nginx/it-request-error.log

# System logs
journalctl -u nginx -f
```

---

## Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra PostgreSQL đang chạy: `systemctl status postgresql`
- Kiểm tra connection string trong `.env`
- Kiểm tra user có quyền: `sudo -u postgres psql -d it_request_tracking -c "\du"`

### Lỗi: "Port 4000 already in use"
```bash
lsof -i :4000
# Hoặc
netstat -tulpn | grep 4000
# Kill process nếu cần
pm2 delete it-request-api
pm2 start ecosystem.config.js
```

### Lỗi: "502 Bad Gateway"
- Kiểm tra PM2: `pm2 status`
- Kiểm tra backend đang chạy: `curl http://localhost:4000/health`
- Kiểm tra Nginx config: `nginx -t`

### Lỗi: "Permission denied"
```bash
chown -R root:root /var/www/it-request-tracking
chmod -R 755 /var/www/it-request-tracking
```

### Lỗi: "pg_dump: command not found" (khi backup)
- Thêm PostgreSQL bin vào PATH
- Hoặc dùng full path: `"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe"`

---

## Tóm tắt Checklist

- [ ] Xóa database cũ trên server (nếu có)
- [ ] Backup database từ máy local
- [ ] Upload backup lên server
- [ ] Cài đặt PostgreSQL trên server
- [ ] Restore database trên server
- [ ] Clone code từ GitHub
- [ ] Cài đặt Node.js và dependencies
- [ ] Cấu hình .env
- [ ] Build server và webapp
- [ ] Cấu hình PM2
- [ ] Cấu hình Nginx
- [ ] Mở firewall ports
- [ ] Test ứng dụng

---

## Liên hệ và Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. PostgreSQL đang chạy
2. PM2 process đang chạy
3. Nginx đang chạy
4. Firewall đã mở port 80, 443
5. Database connection string đúng
6. Logs để xem chi tiết lỗi

**Truy cập ứng dụng:** http://27.71.16.15

