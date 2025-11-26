# Hướng dẫn Triển khai lên Ubuntu Server

## Thông tin Server
- **IP**: 27.71.16.15
- **User**: root
- **OS**: Ubuntu

## Yêu cầu hệ thống
- Node.js 18+ và npm
- PostgreSQL (đã cài đặt local)
- Nginx (reverse proxy)
- PM2 (process manager)

---

## Bước 1: Chuẩn bị Server

### 1.1. Cập nhật hệ thống
```bash
apt update && apt upgrade -y
```

### 1.2. Cài đặt Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version  # Kiểm tra version
npm --version
```

### 1.3. Cài đặt Nginx
```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### 1.4. Cài đặt PM2
```bash
npm install -g pm2
```

### 1.5. Cấu hình Firewall
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## Bước 2: Tạo thư mục và Upload Code

### 2.1. Tạo thư mục dự án
```bash
mkdir -p /var/www/it-request-tracking
cd /var/www/it-request-tracking
```

### 2.2. Upload code lên server

**Cách 1: Sử dụng SCP (từ máy local)**
```bash
# Từ máy local Windows (PowerShell)
scp -r "D:\IT- Request tracking\*" root@27.71.16.15:/var/www/it-request-tracking/
```

**Cách 2: Sử dụng Git (khuyến nghị)**
```bash
# Trên server
cd /var/www/it-request-tracking
git clone <your-repo-url> .
# Hoặc nếu đã có code, upload bằng SCP
```

**Cách 3: Sử dụng rsync**
```bash
# Từ máy local
rsync -avz --exclude 'node_modules' --exclude 'dist' "D:/IT- Request tracking/" root@27.71.16.15:/var/www/it-request-tracking/
```

---

## Bước 3: Cài đặt Dependencies

### 3.1. Cài đặt dependencies
```bash
cd /var/www/it-request-tracking
npm install
npm run postinstall  # Cài đặt dependencies cho server và webapp
```

---

## Bước 4: Cấu hình Database

### 4.1. Kiểm tra PostgreSQL
```bash
sudo -u postgres psql
```

### 4.2. Tạo database và user (nếu chưa có)
```sql
CREATE DATABASE it_request_tracking;
CREATE USER it_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE it_request_tracking TO it_user;
\q
```

### 4.3. Chạy schema SQL
```bash
cd /var/www/it-request-tracking/server/db
sudo -u postgres psql -d it_request_tracking -f schema.sql
```

---

## Bước 5: Cấu hình Environment Variables

### 5.1. Tạo file .env cho server
```bash
cd /var/www/it-request-tracking/server
nano .env
```

**Nội dung file .env:**
```env
PORT=4000
DATABASE_URL=postgresql://it_user:your_secure_password@localhost:5432/it_request_tracking
NODE_ENV=production
```

### 5.2. Tạo file .env cho webapp (nếu cần)
```bash
cd /var/www/it-request-tracking/webapp
nano .env.production
```

**Nội dung file .env.production:**
```env
VITE_API_URL=http://27.71.16.15/api
```

---

## Bước 6: Build Production

### 6.1. Build server
```bash
cd /var/www/it-request-tracking/server
npm run build
```

### 6.2. Build webapp
```bash
cd /var/www/it-request-tracking/webapp
npm run build
```

**Lưu ý**: Cần set VITE_API_URL trước khi build:
```bash
export VITE_API_URL=http://27.71.16.15/api
npm run build
```

---

## Bước 7: Cấu hình PM2

### 7.1. Tạo file ecosystem.config.js
```bash
cd /var/www/it-request-tracking
nano ecosystem.config.js
```

**Nội dung:**
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
      PORT: 4000
    },
    error_file: '/var/log/pm2/it-api-error.log',
    out_file: '/var/log/pm2/it-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
}
```

### 7.2. Tạo thư mục log
```bash
mkdir -p /var/log/pm2
```

### 7.3. Khởi động PM2
```bash
cd /var/www/it-request-tracking
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Tạo startup script
```

---

## Bước 8: Cấu hình Nginx

### 8.1. Tạo file cấu hình Nginx
```bash
nano /etc/nginx/sites-available/it-request-tracking
```

**Nội dung:**
```nginx
server {
    listen 80;
    server_name 27.71.16.15;

    # Logs
    access_log /var/log/nginx/it-request-access.log;
    error_log /var/log/nginx/it-request-error.log;

    # Root directory cho webapp
    root /var/www/it-request-tracking/webapp/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Serve static files từ webapp
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # API proxy - Forward tất cả requests /api/* tới backend
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
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve uploaded files
    location /api/uploads {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 8.2. Kích hoạt site
```bash
ln -s /etc/nginx/sites-available/it-request-tracking /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Xóa default nếu không cần
nginx -t  # Kiểm tra cấu hình
systemctl reload nginx
```

---

## Bước 9: Tạo thư mục uploads

### 9.1. Tạo thư mục và set quyền
```bash
mkdir -p /var/www/it-request-tracking/server/uploads
chown -R root:root /var/www/it-request-tracking/server/uploads
chmod 755 /var/www/it-request-tracking/server/uploads
```

---

## Bước 10: Kiểm tra và Test

### 10.1. Kiểm tra PM2
```bash
pm2 status
pm2 logs it-request-api
```

### 10.2. Kiểm tra Nginx
```bash
systemctl status nginx
tail -f /var/log/nginx/it-request-error.log
```

### 10.3. Test API
```bash
curl http://localhost:4000/health
curl http://27.71.16.15/api/health
```

### 10.4. Test Web
Mở trình duyệt và truy cập: `http://27.71.16.15`

---

## Bước 11: Cấu hình SSL (Tùy chọn - Khuyến nghị)

### 11.1. Cài đặt Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 11.2. Cấu hình SSL (nếu có domain)
```bash
certbot --nginx -d your-domain.com
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

### Lỗi: Cannot connect to database
- Kiểm tra PostgreSQL đang chạy: `systemctl status postgresql`
- Kiểm tra connection string trong `.env`
- Kiểm tra firewall: `ufw status`

### Lỗi: Port 4000 đã được sử dụng
```bash
lsof -i :4000
# Hoặc
netstat -tulpn | grep 4000
```

### Lỗi: Permission denied
```bash
chown -R root:root /var/www/it-request-tracking
chmod -R 755 /var/www/it-request-tracking
```

### Lỗi: 502 Bad Gateway
- Kiểm tra PM2: `pm2 status`
- Kiểm tra backend đang chạy: `curl http://localhost:4000/health`
- Kiểm tra Nginx config: `nginx -t`

---

## Cập nhật Code (Deploy mới)

```bash
cd /var/www/it-request-tracking

# 1. Backup (nếu cần)
cp -r server/uploads server/uploads.backup

# 2. Pull code mới hoặc upload code mới

# 3. Cài đặt dependencies
npm install
npm run postinstall

# 4. Build lại
cd server && npm run build
cd ../webapp
export VITE_API_URL=http://27.71.16.15/api
npm run build

# 5. Restart PM2
pm2 restart it-request-api

# 6. Reload Nginx
systemctl reload nginx
```

---

## Bảo mật

1. **Đổi mật khẩu root**: `passwd`
2. **Tạo user mới với sudo**: `adduser deploy && usermod -aG sudo deploy`
3. **Disable root login SSH**: Chỉnh sửa `/etc/ssh/sshd_config`
4. **Cấu hình fail2ban**: `apt install fail2ban`
5. **Cập nhật thường xuyên**: `apt update && apt upgrade`

---

## Liên hệ

Nếu gặp vấn đề, kiểm tra logs và đảm bảo:
- PostgreSQL đang chạy
- PM2 process đang chạy
- Nginx đang chạy
- Firewall đã mở port 80, 443
- Database connection string đúng

