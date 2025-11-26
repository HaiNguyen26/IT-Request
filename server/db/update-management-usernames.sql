-- Script cập nhật username từ trunghai/thanhtung sang tên đầy đủ
-- Sử dụng: psql -U postgres -d it_request -f update-management-usernames.sql

-- Cập nhật username cho IT Manager
UPDATE management_accounts
SET username = 'nguyễn trung hải',
    updated_at = NOW()
WHERE username = 'trunghai' AND role = 'itManager';

-- Cập nhật username cho Leadership
UPDATE management_accounts
SET username = 'lê thanh tùng',
    updated_at = NOW()
WHERE username = 'thanhtung' AND role = 'leadership';

-- Kiểm tra kết quả
SELECT 
    role,
    username,
    display_name,
    email
FROM management_accounts
ORDER BY role;

-- Thông báo
DO $$
BEGIN
    RAISE NOTICE 'Đã cập nhật username:';
    RAISE NOTICE '  - IT Manager: trunghai -> nguyễn trung hải';
    RAISE NOTICE '  - Leadership: thanhtung -> lê thanh tùng';
END $$;

