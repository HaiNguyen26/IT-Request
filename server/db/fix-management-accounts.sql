-- Script sửa management_accounts: chỉ giữ lại 2 bản ghi (IT Manager và Leadership)
-- Sử dụng: psql -U postgres -d it_request_tracking -f fix-management-accounts.sql

-- Xóa tất cả management_accounts
DELETE FROM management_accounts;

-- Chèn lại 2 bản ghi đúng
INSERT INTO management_accounts (role, username, password_hash, display_name, email, department)
VALUES
    ('itManager', 'trunghai', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Nguyễn Trung Hải', 'nguyen.trung.hai@rmg123.com', 'IT Operations'),
    ('leadership', 'thanhtung', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Lê Thanh Tùng', 'le.thanh.tung@rmg123.com', 'Điều hành');

-- Kiểm tra kết quả
SELECT 
    id,
    role,
    username,
    display_name,
    email,
    department,
    created_at
FROM management_accounts
ORDER BY role;

-- Đếm số lượng
SELECT COUNT(*) AS total_management_accounts FROM management_accounts;

-- Thông báo
DO $$
BEGIN
    RAISE NOTICE 'Đã sửa management_accounts: chỉ còn 2 bản ghi (IT Manager và Leadership)';
END $$;

