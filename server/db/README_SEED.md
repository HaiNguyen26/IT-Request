# Mock Data cho IT Request Tracking System

File này chứa mock data để test hệ thống với 3 loại user:
- **User (Employee)** - Nhân viên
- **IT Manager** - Quản lý IT  
- **Leadership Manager** - Ban Lãnh Đạo

## Cách sử dụng

```bash
# Sau khi chạy schema.sql, chạy seed data:

# Với user postgres:
psql -U postgres -d it_request -f server/db/seed.sql

# Hoặc với user Admin (Windows):
psql -U Admin -d it_request -f server/db/seed.sql
```

Password khi được hỏi: `Hainguyen261097`

## Dữ liệu Mock

### 1. Employees (8 nhân viên)
Tất cả employees có password mặc định: `RMG123@`

| Email | Tên | Phòng ban |
|-------|-----|-----------|
| nguyen.van.an@rmg123.com | Nguyễn Văn An | Marketing |
| tran.thi.binh@rmg123.com | Trần Thị Bình | Sales |
| le.van.cuong@rmg123.com | Lê Văn Cường | HR |
| pham.thi.dung@rmg123.com | Phạm Thị Dung | Finance |
| hoang.van.em@rmg123.com | Hoàng Văn Em | Operations |
| vu.thi.phuong@rmg123.com | Vũ Thị Phương | Marketing |
| dang.van.giang@rmg123.com | Đặng Văn Giang | IT |
| bui.thi.hoa@rmg123.com | Bùi Thị Hoa | HR |

### 2. Management Accounts (Đã có trong schema.sql)
- **IT Manager**: username `it`, password `RMG123@`
- **Leadership**: username `leadership`, password `RMG123@`

### 3. Service Requests (~10 requests)
- Các trạng thái khác nhau: new, inProgress, waiting, completed
- Các mức độ ưu tiên: urgent, high, medium, low
- Các loại: Sửa chữa thiết bị, Hỗ trợ phần mềm, Mua sắm thiết bị, Bảo trì định kỳ, Khác

### 4. Request Notes
- Notes công khai (public) và nội bộ (internal)
- Từ các tác giả: IT Manager, IT Support

## Test Accounts

### Đăng nhập như User (Employee):
- Email: `nguyen.van.an@rmg123.com`
- Password: `RMG123@`

### Đăng nhập như IT Manager:
- Username: `it`
- Password: `RMG123@`

### Đăng nhập như Leadership:
- Username: `leadership`
- Password: `RMG123@`

