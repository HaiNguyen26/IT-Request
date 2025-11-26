# Tài Khoản Đăng Nhập - IT Request Tracking System

## Tài Khoản IT và Quản Lý

### 1. IT Manager (Quản lý IT)
- **Username**: `trunghai`
- **Password**: `RMG123@`
- **Role**: `itManager`
- **Display Name**: Nguyễn Trung Hải
- **Email**: nguyen.trung.hai@rmg123.com
- **Department**: IT Operations

### 2. Leadership (Ban Lãnh Đạo)
- **Username**: `thanhtung`
- **Password**: `RMG123@`
- **Role**: `leadership`
- **Display Name**: Lê Thanh Tùng
- **Email**: le.thanh.tung@rmg123.com
- **Department**: Điều hành

---

## Tài Khoản Nhân Viên (Employee)

Tất cả nhân viên đăng nhập bằng **TÊN** (không phải email) và password mặc định:
- **Password**: `RMG123@`

### Danh sách nhân viên:

1. **Nguyễn Văn An** - Marketing
   - Tên đăng nhập: `Nguyễn Văn An`
   - Password: `RMG123@`

2. **Trần Thị Bình** - Sales
   - Tên đăng nhập: `Trần Thị Bình`
   - Password: `RMG123@`

3. **Lê Văn Cường** - HR
   - Tên đăng nhập: `Lê Văn Cường`
   - Password: `RMG123@`

4. **Phạm Thị Dung** - Finance
   - Tên đăng nhập: `Phạm Thị Dung`
   - Password: `RMG123@`

5. **Hoàng Văn Em** - Operations
   - Tên đăng nhập: `Hoàng Văn Em`
   - Password: `RMG123@`

6. **Vũ Thị Phương** - Marketing
   - Tên đăng nhập: `Vũ Thị Phương`
   - Password: `RMG123@`

7. **Đặng Văn Giang** - IT
   - Tên đăng nhập: `Đặng Văn Giang`
   - Password: `RMG123@`

8. **Bùi Thị Hoa** - HR
   - Tên đăng nhập: `Bùi Thị Hoa`
   - Password: `RMG123@`

9. **Nguyễn Trung Hải** - IT Operations
   - Tên đăng nhập: `Nguyễn Trung Hải`
   - Password: `RMG123@`
   - **Lưu ý**: Cũng có tài khoản IT Manager (username: `trunghai`)

10. **Lê Thanh Tùng** - Điều hành
    - Tên đăng nhập: `Lê Thanh Tùng`
    - Password: `RMG123@`
    - **Lưu ý**: Cũng có tài khoản Leadership (username: `thanhtung`)

---

## Hướng Dẫn Đăng Nhập

### Đăng nhập như Employee (Nhân viên):
1. Trong trang đăng nhập, chọn tab **NHÂN VIÊN** (tab đầu tiên)
2. Tên đăng nhập: Nhập **TÊN ĐẦY ĐỦ** (ví dụ: `Nguyễn Văn An`)
3. Password: `RMG123@`
4. Nhấn nút "Đăng nhập"

### Đăng nhập như IT Manager:
1. Trong trang đăng nhập, chọn tab **IT MANAGER** (tab thứ hai)
2. Tên đăng nhập: `trunghai` (**KHÔNG PHẢI EMAIL!**)
3. Password: `RMG123@`
4. Nhấn nút "Đăng nhập IT Manager"

### Đăng nhập như Leadership:
1. Trong trang đăng nhập, chọn tab **LEADERSHIP** (tab thứ ba)
2. Tên đăng nhập: `thanhtung` (**KHÔNG PHẢI EMAIL!**)
3. Password: `RMG123@`
4. Nhấn nút "Đăng nhập Leadership"

**⚠️ LƯU Ý QUAN TRỌNG:**
- IT Manager và Leadership sử dụng **Username** (không phải email)
- Employee sử dụng **TÊN ĐẦY ĐỦ** (không phải email)
- Nếu bạn nhập username của IT/Leadership vào tab "NHÂN VIÊN", sẽ hiện lỗi "Tên không tồn tại trong hệ thống"
- Phải chọn đúng tab tương ứng với loại tài khoản bạn muốn đăng nhập

---

## Lưu ý

- Tất cả password đều là: `RMG123@`
- Tài khoản IT và Leadership được tạo tự động trong `schema.sql`
- Tài khoản Employee được tạo trong `seed.sql`
- Password hash được mã hóa bằng bcrypt với cost factor 10

## Nếu tài khoản IT không tồn tại

Nếu bạn gặp lỗi "tài khoản IT không tồn tại", hãy chạy script sau để tạo lại:

### Cách 1: Sử dụng script PowerShell (KHUYẾN NGHỊ cho PowerShell)
```powershell
# Di chuyển vào thư mục chứa script
cd "D:\IT- Request tracking\server\db"

# Chạy script PowerShell
.\create-management-accounts.ps1
```

Hoặc với tham số tùy chỉnh:
```powershell
.\create-management-accounts.ps1 -DB_USER postgres -DB_NAME it_request
```

### Cách 2: Sử dụng script batch (Windows CMD)
```cmd
# Di chuyển vào thư mục chứa script
cd "D:\IT- Request tracking\server\db"

# Chạy script
create-management-accounts.bat
```

### Cách 3: Chạy SQL trực tiếp trong PowerShell
```powershell
# Di chuyển vào thư mục chứa file SQL
cd "D:\IT- Request tracking\server\db"

# Set environment variables (PowerShell syntax)
$env:PGPASSWORD = "Hainguyen261097"
$env:PGCLIENTENCODING = "UTF8"

# Chạy SQL
psql -U postgres -d it_request -f create-management-accounts.sql --set=client_encoding=UTF8
```

### Cách 4: Chạy SQL trực tiếp trong CMD
```cmd
# Di chuyển vào thư mục chứa file SQL
cd "D:\IT- Request tracking\server\db"

# Set environment variables (CMD syntax)
set PGPASSWORD=Hainguyen261097
set PGCLIENTENCODING=UTF8

# Chạy SQL
psql -U postgres -d it_request -f create-management-accounts.sql --set=client_encoding=UTF8
```

**Password PostgreSQL**: `Hainguyen261097`

**Lưu ý**: 
- Trong PowerShell, dùng `$env:VARIABLE = "value"` để set environment variable
- Trong CMD, dùng `set VARIABLE=value` để set environment variable
- Đảm bảo bạn đang ở đúng thư mục hoặc sử dụng đường dẫn đầy đủ đến file SQL

Script sẽ:
- Tạo lại tài khoản IT Manager (username: `trunghai`, Nguyễn Trung Hải)
- Tạo lại tài khoản Leadership (username: `thanhtung`, Lê Thanh Tùng)
- Hiển thị thông tin tài khoản đã tạo

