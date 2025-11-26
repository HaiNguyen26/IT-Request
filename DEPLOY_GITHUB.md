# Hướng dẫn Triển khai từ GitHub

## Repository: https://github.com/HaiNguyen26/IT-Request.git

---

## Bước 1: Xóa code cũ trên server

### Chạy script cleanup
```bash
# SSH vào server
ssh root@27.71.16.15

# Upload script cleanup
scp cleanup-server.sh root@27.71.16.15:/root/

# Chạy script
ssh root@27.71.16.15
chmod +x cleanup-server.sh
./cleanup-server.sh
```

**Hoặc xóa thủ công:**
```bash
# Dừng PM2
pm2 delete it-request-api
pm2 save

# Xóa Nginx config
rm -f /etc/nginx/sites-enabled/it-request-tracking
rm -f /etc/nginx/sites-available/it-request-tracking
systemctl reload nginx

# Xóa code (giữ lại uploads nếu cần)
rm -rf /var/www/it-request-tracking
```

---

## Bước 2: Push code lên GitHub

### 2.1. Khởi tạo Git repository (nếu chưa có)

```bash
# Từ máy local Windows
cd "D:\IT- Request tracking"

# Khởi tạo git
git init

# Thêm remote
git remote add origin https://github.com/HaiNguyen26/IT-Request.git

# Kiểm tra .gitignore đã có chưa
# (File .gitignore đã được tạo sẵn)
```

### 2.2. Commit và push code

```bash
# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit: IT Request Tracking System"

# Push lên GitHub
git branch -M main
git push -u origin main
```

**Nếu gặp lỗi authentication:**
- Sử dụng Personal Access Token thay vì password
- Hoặc cấu hình SSH key

---

## Bước 3: Cài đặt Git trên Server

```bash
# SSH vào server
ssh root@27.71.16.15

# Cài đặt Git
apt update
apt install -y git
```

---

## Bước 4: Clone code từ GitHub

```bash
# Tạo thư mục và clone
mkdir -p /var/www
cd /var/www
git clone https://github.com/HaiNguyen26/IT-Request.git it-request-tracking
cd it-request-tracking
```

---

## Bước 5: Cài đặt Dependencies

```bash
cd /var/www/it-request-tracking

# Cài đặt Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Cài đặt PM2
npm install -g pm2

# Cài đặt dependencies
npm install
npm run postinstall
```

---

## Bước 6: Cấu hình Database

### 6.1. Kiểm tra PostgreSQL
```bash
systemctl status postgresql
```

### 6.2. Tạo database (nếu chưa có)
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE it_request_tracking;
CREATE USER it_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE it_request_tracking TO it_user;
\q
```

### 6.3. Chạy schema
```bash
cd /var/www/it-request-tracking/server/db
sudo -u postgres psql -d it_request_tracking -f schema.sql
```

---

## Bước 7: Cấu hình Environment Variables

```bash
cd /var/www/it-request-tracking/server
cp .env.example .env
nano .env
```

**Nội dung .env:**
```env
PORT=4000
DATABASE_URL=postgresql://it_user:your_password@localhost:5432/it_request_tracking
NODE_ENV=production
```

---

## Bước 8: Build và Deploy

### 8.1. Build production
```bash
cd /var/www/it-request-tracking

# Build server
cd server
npm run build
cd ..

# Build webapp (với API URL)
cd webapp
export VITE_API_URL=http://27.71.16.15/api
npm run build
cd ..
```

### 8.2. Tạo thư mục uploads
```bash
mkdir -p /var/www/it-request-tracking/server/uploads
chmod 755 /var/www/it-request-tracking/server/uploads
```

### 8.3. Khởi động PM2
```bash
cd /var/www/it-request-tracking
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8.4. Cấu hình Nginx
```bash
# Copy config
cp nginx.conf.example /etc/nginx/sites-available/it-request-tracking

# Chỉnh sửa nếu cần
nano /etc/nginx/sites-available/it-request-tracking

# Enable site
ln -s /etc/nginx/sites-available/it-request-tracking /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test và reload
nginx -t
systemctl reload nginx
```

---

## Bước 9: Cấu hình Firewall

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (nếu có SSL)
ufw enable
```

---

## Bước 10: Kiểm tra

```bash
# Kiểm tra PM2
pm2 status
pm2 logs it-request-api

# Kiểm tra Nginx
systemctl status nginx

# Test API
curl http://localhost:4000/health
curl http://27.71.16.15/api/health
```

**Truy cập ứng dụng:** `http://27.71.16.15`

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

## Script Deploy Tự động (Từ GitHub)

Tạo file `deploy-from-github.sh`:

```bash
#!/bin/bash
set -e

cd /var/www/it-request-tracking

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm install
npm run postinstall

echo "Building..."
cd server && npm run build && cd ..
cd webapp && export VITE_API_URL=http://27.71.16.15/api && npm run build && cd ..

echo "Restarting services..."
pm2 restart it-request-api
systemctl reload nginx

echo "Deployment completed!"
```

**Sử dụng:**
```bash
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

---

## Lưu ý quan trọng

1. **Database**: Database local không bị ảnh hưởng, chỉ code được pull từ GitHub
2. **Uploads**: Thư mục `server/uploads/` được ignore trong Git, cần backup trước khi deploy mới
3. **.env**: File `.env` không được commit lên GitHub, phải cấu hình trên server
4. **Secrets**: Không commit mật khẩu, API keys vào Git

---

## Troubleshooting

### Lỗi: Permission denied khi git pull
```bash
chown -R root:root /var/www/it-request-tracking
```

### Lỗi: Cannot find module sau khi pull
```bash
npm install
npm run postinstall
```

### Lỗi: Build failed
```bash
# Kiểm tra Node version
node --version  # Cần >= 18

# Xóa node_modules và cài lại
rm -rf node_modules server/node_modules webapp/node_modules
npm install
npm run postinstall
```

---

## Tóm tắt Workflow

1. **Development** (Local) → Commit & Push → **GitHub**
2. **GitHub** → Pull → **Server Ubuntu**
3. **Server** → Build & Deploy → **Production**

