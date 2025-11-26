# Khắc Phục Lỗi Đăng Nhập

## Lỗi: "Email không tồn tại trong hệ thống"

Lỗi này xảy ra khi bạn cố đăng nhập với email của Employee nhưng email đó chưa có trong database.

### Nguyên nhân:
1. Database chưa được seed với dữ liệu employees
2. Email bạn nhập không đúng với email trong database
3. Bạn đang nhầm lẫn giữa đăng nhập Employee và Management

---

## Cách Khắc Phục

### Bước 1: Kiểm tra database đã có employees chưa

Chạy lệnh sau để kiểm tra:

**Trong PowerShell:**
```powershell
cd "D:\IT- Request tracking\server\db"
.\verify-data.bat
```

**Trong CMD:**
```cmd
cd server\db
verify-data.bat
```

Hoặc chạy SQL trực tiếp:
```sql
SELECT COUNT(*) FROM employees;
```

Nếu kết quả là `0` → Database chưa có employees, cần chạy seed data.

### Bước 2: Chạy seed data để tạo employees

**Trong PowerShell:**
```powershell
cd "D:\IT- Request tracking\server\db"
.\seed.bat postgres it_request
```

**Trong CMD:**
```cmd
cd server\db
seed.bat postgres it_request
```

Hoặc:
```powershell
cd "D:\IT- Request tracking\server\db"
.\run-seed-utf8.bat postgres it_request
```

Password PostgreSQL: `Hainguyen261097`

### Bước 3: Xác nhận employees đã được tạo

Sau khi chạy seed, kiểm tra lại:

**Trong PowerShell:**
```powershell
cd "D:\IT- Request tracking\server\db"
.\verify-data.bat
```

**Trong CMD:**
```cmd
cd server\db
verify-data.bat
```

Bạn sẽ thấy danh sách 8 employees.

---

## Hướng Dẫn Đăng Nhập Đúng

### Đăng nhập như Employee (Nhân viên):
- **Sử dụng**: Email
- **Password**: `RMG123@`
- **Ví dụ**:
  - Email: `nguyen.van.an@rmg123.com`
  - Password: `RMG123@`

### Đăng nhập như IT Manager:
- **Sử dụng**: Username (KHÔNG phải email)
- **Username**: `it`
- **Password**: `RMG123@`
- **Lưu ý**: Phải chọn role "IT Manager" trong form đăng nhập

### Đăng nhập như Leadership:
- **Sử dụng**: Username (KHÔNG phải email)
- **Username**: `leadership`
- **Password**: `RMG123@`
- **Lưu ý**: Phải chọn role "Leadership" trong form đăng nhập

---

## Danh Sách Email Employees (Sau khi seed)

1. `nguyen.van.an@rmg123.com` - Nguyễn Văn An (Marketing)
2. `tran.thi.binh@rmg123.com` - Trần Thị Bình (Sales)
3. `le.van.cuong@rmg123.com` - Lê Văn Cường (HR)
4. `pham.thi.dung@rmg123.com` - Phạm Thị Dung (Finance)
5. `hoang.van.em@rmg123.com` - Hoàng Văn Em (Operations)
6. `vu.thi.phuong@rmg123.com` - Vũ Thị Phương (Marketing)
7. `dang.van.giang@rmg123.com` - Đặng Văn Giang (IT)
8. `bui.thi.hoa@rmg123.com` - Bùi Thị Hoa (HR)

Tất cả đều dùng password: `RMG123@`

---

## Kiểm Tra Nhanh

### 1. Kiểm tra employees:
```sql
SELECT email, name, department FROM employees LIMIT 10;
```

Hoặc chạy script:
```powershell
cd "D:\IT- Request tracking\server\db"
.\verify-data.bat
```

### 2. Kiểm tra management accounts:
```sql
SELECT username, role, display_name FROM management_accounts;
```

Hoặc chạy script:
```powershell
cd "D:\IT- Request tracking\server\db"
.\create-management-accounts.ps1
```

### 3. Nếu chưa có dữ liệu:

**Chạy schema (tạo tables):**
```powershell
cd "D:\IT- Request tracking\server\db"
.\run-schema.bat postgres it_request
```

**Chạy seed (tạo employees và requests):**
```powershell
cd "D:\IT- Request tracking\server\db"
.\seed.bat postgres it_request
```

**Chạy tạo management accounts:**
```powershell
cd "D:\IT- Request tracking\server\db"
.\create-management-accounts.ps1
```

Hoặc chạy tất cả cùng lúc:
```powershell
cd "D:\IT- Request tracking\server\db"
.\run-all.bat postgres it_request
```

---

## Lưu Ý Quan Trọng

⚠️ **KHÔNG dùng email để đăng nhập IT Manager hoặc Leadership**
- IT Manager dùng **username**: `it`
- Leadership dùng **username**: `leadership`
- Chỉ Employee mới dùng **email** để đăng nhập

