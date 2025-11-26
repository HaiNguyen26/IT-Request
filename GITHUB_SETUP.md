# Hướng dẫn Push Code lên GitHub

## Repository: https://github.com/HaiNguyen26/IT-Request.git

---

## Bước 1: Xóa code cũ trên Server

### Upload và chạy script cleanup
```bash
# Từ máy local Windows (PowerShell)
scp cleanup-server.sh root@27.71.16.15:/root/

# SSH vào server
ssh root@27.71.16.15

# Chạy script
chmod +x cleanup-server.sh
./cleanup-server.sh
```

**Hoặc xóa thủ công:**
```bash
pm2 delete it-request-api
rm -rf /var/www/it-request-tracking
rm -f /etc/nginx/sites-enabled/it-request-tracking
systemctl reload nginx
```

---

## Bước 2: Khởi tạo Git Repository (Local)

```bash
# Mở PowerShell hoặc Git Bash
cd "D:\IT- Request tracking"

# Kiểm tra xem đã có .git chưa
# Nếu chưa có, khởi tạo:
git init

# Thêm remote GitHub
git remote add origin https://github.com/HaiNguyen26/IT-Request.git

# Kiểm tra remote
git remote -v
```

---

## Bước 3: Kiểm tra .gitignore

File `.gitignore` đã được tạo sẵn, nó sẽ ignore:
- `node_modules/`
- `dist/`
- `.env` files
- `server/uploads/*` (files, nhưng giữ thư mục)
- Logs và cache files

**Lưu ý:** File `.env` chứa mật khẩu sẽ KHÔNG được commit.

---

## Bước 4: Commit và Push Code

```bash
# Kiểm tra files sẽ được commit
git status

# Thêm tất cả files (theo .gitignore)
git add .

# Commit
git commit -m "Initial commit: IT Request Tracking System"

# Đổi tên branch thành main (nếu cần)
git branch -M main

# Push lên GitHub
git push -u origin main
```

---

## Bước 5: Xử lý Authentication

### Nếu gặp lỗi authentication:

**Cách 1: Sử dụng Personal Access Token**
1. Vào GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Chọn quyền: `repo` (full control)
4. Copy token
5. Khi push, sử dụng token thay vì password:
   ```
   Username: HaiNguyen26
   Password: [paste token here]
   ```

**Cách 2: Cấu hình SSH Key**
```bash
# Tạo SSH key (nếu chưa có)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Thêm vào GitHub: Settings → SSH and GPG keys → New SSH key

# Đổi remote sang SSH
git remote set-url origin git@github.com:HaiNguyen26/IT-Request.git
```

---

## Bước 6: Verify trên GitHub

1. Truy cập: https://github.com/HaiNguyen26/IT-Request
2. Kiểm tra code đã được push
3. Kiểm tra `.gitignore` đang hoạt động (không thấy `node_modules`, `.env`)

---

## Bước 7: Clone và Deploy trên Server

Xem hướng dẫn chi tiết trong **DEPLOY_GITHUB.md**

**Tóm tắt:**
```bash
# SSH vào server
ssh root@27.71.16.15

# Cài đặt Git
apt install -y git

# Clone repository
cd /var/www
git clone https://github.com/HaiNguyen26/IT-Request.git it-request-tracking
cd it-request-tracking

# Tiếp tục theo DEPLOY_GITHUB.md
```

---

## Cập nhật Code sau này

### Khi có thay đổi code:

```bash
# Từ máy local
cd "D:\IT- Request tracking"

# Kiểm tra thay đổi
git status

# Thêm files
git add .

# Commit
git commit -m "Description of changes"

# Push
git push origin main
```

### Trên server, pull code mới:

```bash
# SSH vào server
ssh root@27.71.16.15

cd /var/www/it-request-tracking

# Pull code mới
git pull origin main

# Deploy (sử dụng script)
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

---

## Lưu ý quan trọng

1. **Không commit `.env`**: File này chứa mật khẩu database
2. **Không commit `node_modules`**: Đã được ignore trong `.gitignore`
3. **Uploads**: Files trong `server/uploads/` không được commit, chỉ giữ thư mục
4. **Database**: Database local không được migrate, chỉ code được quản lý qua Git

---

## Troubleshooting

### Lỗi: remote origin already exists
```bash
git remote remove origin
git remote add origin https://github.com/HaiNguyen26/IT-Request.git
```

### Lỗi: failed to push some refs
```bash
# Pull trước khi push
git pull origin main --allow-unrelated-histories
git push origin main
```

### Lỗi: authentication failed
- Kiểm tra Personal Access Token
- Hoặc cấu hình SSH key

---

## Tóm tắt Workflow

```
Local Development
    ↓
git add . && git commit -m "message"
    ↓
git push origin main
    ↓
GitHub Repository
    ↓
Server: git pull origin main
    ↓
Server: ./deploy-from-github.sh
    ↓
Production Live
```

