# Quick Deploy Guide - Ubuntu Server

## Tóm tắt nhanh các bước triển khai

### 1. Trên Server Ubuntu (27.71.16.15)

```bash
# Cài đặt dependencies hệ thống
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx
npm install -g pm2

# Tạo thư mục dự án
mkdir -p /var/www/it-request-tracking
cd /var/www/it-request-tracking
```

### 2. Upload Code từ máy local

**Từ Windows PowerShell:**
```powershell
# Upload toàn bộ code (loại trừ node_modules và dist)
scp -r "D:\IT- Request tracking\*" root@27.71.16.15:/var/www/it-request-tracking/
```

**Hoặc sử dụng rsync (nếu có):**
```bash
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' "D:/IT- Request tracking/" root@27.71.16.15:/var/www/it-request-tracking/
```

### 3. Trên Server - Chạy script deploy tự động

```bash
cd /var/www/it-request-tracking
chmod +x deploy.sh
./deploy.sh
```

**Hoặc làm thủ công:**

```bash
# 1. Cài đặt dependencies
npm install
npm run postinstall

# 2. Cấu hình .env
cd server
cp .env.example .env
nano .env  # Chỉnh sửa DATABASE_URL
cd ..

# 3. Build
cd server && npm run build && cd ..
cd webapp && VITE_API_URL=http://27.71.16.15/api npm run build && cd ..

# 4. Khởi động PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 5. Cấu hình Nginx
cp nginx.conf.example /etc/nginx/sites-available/it-request-tracking
ln -s /etc/nginx/sites-available/it-request-tracking /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. Kiểm tra

```bash
# Kiểm tra PM2
pm2 status

# Kiểm tra Nginx
systemctl status nginx

# Test API
curl http://localhost:4000/health
curl http://27.71.16.15/api/health
```

### 5. Truy cập ứng dụng

Mở trình duyệt: `http://27.71.16.15`

---

## Các file quan trọng đã tạo:

1. **DEPLOY.md** - Hướng dẫn chi tiết đầy đủ
2. **deploy.sh** - Script tự động triển khai
3. **build-production.sh** - Script build production
4. **ecosystem.config.js** - Cấu hình PM2
5. **nginx.conf.example** - Cấu hình Nginx mẫu
6. **server/.env.example** - Template environment variables

---

## Lưu ý quan trọng:

1. **Database**: Đảm bảo PostgreSQL đã được cài đặt và chạy schema.sql
2. **Firewall**: Mở port 80: `ufw allow 80/tcp`
3. **.env**: Phải cấu hình đúng DATABASE_URL trong server/.env
4. **Build**: Phải set VITE_API_URL trước khi build webapp

---

## Troubleshooting nhanh:

```bash
# Xem logs PM2
pm2 logs it-request-api

# Xem logs Nginx
tail -f /var/log/nginx/it-request-error.log

# Restart services
pm2 restart it-request-api
systemctl restart nginx
```

