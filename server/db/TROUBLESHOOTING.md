# Troubleshooting PostgreSQL Connection

## Lỗi: Password authentication failed for user "Admin"

### Vấn đề
Khi chạy `psql -U Admin`, bạn gặp lỗi: `password authentication failed for user "Admin"`

### Giải pháp

#### Giải pháp 1: Sử dụng user "postgres" mặc định (Khuyến nghị)
PostgreSQL thường có user mặc định là `postgres`:

```bash
# Trên Windows PowerShell hoặc Command Prompt:
psql -U postgres -d it_request -f server/db/schema.sql
psql -U postgres -d it_request -f server/db/seed.sql
```

Password: `Hainguyen261097`

#### Giải pháp 2: Kiểm tra user "Admin" có tồn tại không

1. **Kết nối với user postgres để kiểm tra:**
   ```bash
   psql -U postgres
   # Nhập password: Hainguyen261097
   ```

2. **Kiểm tra danh sách users:**
   ```sql
   \du
   ```

3. **Nếu user "Admin" không tồn tại, tạo user mới:**
   ```sql
   CREATE USER "Admin" WITH PASSWORD 'Hainguyen261097';
   ALTER USER "Admin" CREATEDB;
   \q
   ```

4. **Sau đó chạy lại:**
   ```bash
   psql -U Admin -d it_request -f server/db/schema.sql
   ```

#### Giải pháp 3: Sử dụng PGPASSWORD environment variable

**Windows PowerShell:**
```powershell
$env:PGPASSWORD="Hainguyen261097"
psql -U postgres -d it_request -f server/db/schema.sql
```

**Windows Command Prompt:**
```cmd
set PGPASSWORD=Hainguyen261097
psql -U postgres -d it_request -f server/db/schema.sql
```

#### Giải pháp 4: Tạo database nếu chưa có

Nếu database `it_request` chưa tồn tại:

```bash
# Kết nối với PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE it_request;

# Thoát
\q

# Chạy schema
psql -U postgres -d it_request -f server/db/schema.sql
```

## Lỗi: Character encoding (WIN1252 -> UTF8)

### Vấn đề
Khi chạy `seed.sql`, bạn gặp lỗi:
```
ERROR: character with byte sequence 0x9d in encoding "WIN1252" has no equivalent in encoding "UTF8"
```

### Giải pháp

#### Giải pháp 1: Chuyển đổi file sang UTF-8 (Khuyến nghị)

**Sử dụng PowerShell script:**
```powershell
cd server/db
.\convert-to-utf8.ps1
```

**Hoặc chuyển đổi thủ công:**
1. Mở file `seed.sql` trong editor (VS Code, Notepad++)
2. Chuyển encoding sang **UTF-8** (hoặc **UTF-8 without BOM**)
3. Lưu lại file

#### Giải pháp 2: Chạy với client encoding UTF8

**Cách 1: Sử dụng script helper:**
```powershell
cd server/db
seed.bat postgres it_request
```

Script sẽ tự động set `client_encoding = 'UTF8'`.

**Cách 2: Chạy thủ công:**
```powershell
$env:PGPASSWORD="Hainguyen261097"
$env:PGCLIENTENCODING="UTF8"
psql -U postgres -d it_request -c "SET client_encoding = 'UTF8';" -f server/db/seed.sql
```

**Cách 3: Chạy trực tiếp trong psql:**
```powershell
psql -U postgres -d it_request
```
Sau đó trong psql prompt:
```sql
SET client_encoding = 'UTF8';
\i server/db/seed.sql
```

#### Giải pháp 3: Kiểm tra database encoding

Đảm bảo database được tạo với encoding UTF8:

```sql
-- Kiểm tra encoding của database
SELECT datname, pg_encoding_to_char(encoding) FROM pg_database WHERE datname = 'it_request';

-- Nếu không phải UTF8, tạo lại database:
DROP DATABASE it_request;
CREATE DATABASE it_request ENCODING 'UTF8';
```

## Kiểm tra PostgreSQL đang chạy

### Windows:
```powershell
# Kiểm tra service
Get-Service postgresql*

# Hoặc kiểm tra process
Get-Process postgres
```

### Nếu PostgreSQL chưa chạy:
- Mở **Services** (services.msc)
- Tìm **postgresql** service
- Click **Start**

## Cấu hình đúng trong server/.env

Đảm bảo file `server/.env` có nội dung:

```env
DATABASE_URL=postgres://postgres:Hainguyen261097@localhost:5432/it_request
PORT=4000
```

**Lưu ý:** Sử dụng user `postgres` trong DATABASE_URL nếu bạn dùng user `postgres` để kết nối.

## Kiểm tra kết nối

Để kiểm tra kết nối có hoạt động không:

```bash
# Với user postgres:
psql -U postgres -d it_request -c "SELECT version();"

# Hoặc đơn giản là kết nối:
psql -U postgres -d it_request
```

Nếu thành công, bạn sẽ thấy prompt: `it_request=#`
