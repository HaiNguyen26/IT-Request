-- Script tao lai tai khoan IT va Leadership
-- Password: RMG123@ (hash: $2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W)

-- Set encoding
SET client_encoding = 'UTF8';

-- Xoa tai khoan cu neu co (tuy chon)
-- DELETE FROM management_accounts WHERE username IN ('it', 'leadership');

-- Tao lai tai khoan IT Manager va Leadership
-- Nguyễn Trung Hải - IT Manager
-- Lê Thanh Tùng - Leadership
-- Password mặc định: RMG123@
INSERT INTO management_accounts (role, username, password_hash, display_name, email, department)
VALUES
    ('itManager', 'trunghai', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Nguyen Trung Hai', 'nguyen.trung.hai@rmg123.com', 'IT Operations'),
    ('leadership', 'thanhtung', '$2a$10$/noA9ML2d4gAQbr9oOoZ.Ox0NaaC7SVwrT0kXtK1RdJVV6otA735W', 'Le Thanh Tung', 'le.thanh.tung@rmg123.com', 'Dieu hanh')
ON CONFLICT (username) DO UPDATE SET
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    department = EXCLUDED.department;

-- Kiem tra tai khoan da duoc tao
SELECT 
    role,
    username,
    display_name,
    email,
    department,
    created_at
FROM management_accounts
WHERE username IN ('trunghai', 'thanhtung')
ORDER BY role;

