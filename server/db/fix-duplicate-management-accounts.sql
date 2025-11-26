-- Script SQL sửa lỗi duplicate management accounts
-- Xóa các bản ghi cũ (trunghai, thanhtung) và chỉ giữ lại bản ghi mới (tên đầy đủ)
-- Sử dụng: psql -U postgres -d it_request_tracking -f fix-duplicate-management-accounts.sql

-- Xóa bản ghi cũ của IT Manager (trunghai)
DELETE FROM management_accounts
WHERE username = 'trunghai' AND role = 'itManager';

-- Xóa bản ghi cũ của Leadership (thanhtung)
DELETE FROM management_accounts
WHERE username = 'thanhtung' AND role = 'leadership';

-- Đảm bảo chỉ có 2 bản ghi với username mới
-- Nếu chưa có, tạo mới
INSERT INTO management_accounts (role, username, password_hash, display_name, email, department)
VALUES
    ('itManager', 'nguyễn trung hải', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Nguyễn Trung Hải', 'nguyen.trung.hai@rmg123.com', 'IT Operations'),
    ('leadership', 'lê thanh tùng', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Lê Thanh Tùng', 'le.thanh.tung@rmg123.com', 'Điều hành')
ON CONFLICT (username) DO UPDATE
SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    department = EXCLUDED.department,
    updated_at = NOW();

-- Kiểm tra kết quả
SELECT 
    role,
    username,
    display_name,
    email
FROM management_accounts
ORDER BY role;

-- Đếm số lượng
SELECT COUNT(*) as total_accounts FROM management_accounts;

-- Thông báo
DO $$
BEGIN
    RAISE NOTICE 'Đã sửa lỗi duplicate accounts:';
    RAISE NOTICE '  - Đã xóa: trunghai, thanhtung';
    RAISE NOTICE '  - Giữ lại: nguyễn trung hải, lê thanh tùng';
END $$;

