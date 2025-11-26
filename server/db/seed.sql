-- Seed Data cho IT Request Tracking System
-- File này để trống - Dữ liệu sẽ được thêm vào qua ứng dụng hoặc import Excel

-- Lưu ý:
-- - Nhân viên đăng nhập bằng tên (name), không phải email
-- - Mật khẩu mặc định: RMG123@
-- - Hash password: $2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W

-- Tài khoản Management đã được tạo trong schema.sql:
-- - IT Manager: username 'trunghai' (Nguyễn Trung Hải)
-- - Leadership: username 'thanhtung' (Lê Thanh Tùng)

-- Để xóa tất cả phiếu yêu cầu và ghi chú mock data (nếu có):
-- Chạy script: server/db/clear-requests.sql

-- Để thêm nhân viên, sử dụng chức năng import Excel trong ứng dụng
-- hoặc thêm trực tiếp vào bảng employees qua SQL:

-- INSERT INTO employees (name, email, department, password_hash) VALUES
--     ('Tên nhân viên', 'email@rmg123.com', 'Phòng ban', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W');
