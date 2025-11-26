-- Script xóa service_requests và request_notes trên server
-- Chỉ giữ lại employees và management_accounts
-- Sử dụng: psql -U postgres -d it_request_tracking -f clear-requests-on-server.sql

-- Xóa tất cả file attachments trước (vì có foreign key đến request_notes)
DELETE FROM note_attachments;

-- Xóa tất cả notes (vì có foreign key đến service_requests)
DELETE FROM request_notes;

-- Xóa tất cả service requests
DELETE FROM service_requests;

-- Kiểm tra số lượng sau khi xóa
SELECT 
    'service_requests' AS table_name,
    COUNT(*) AS remaining_count
FROM service_requests
UNION ALL
SELECT 
    'request_notes' AS table_name,
    COUNT(*) AS remaining_count
FROM request_notes
UNION ALL
SELECT 
    'note_attachments' AS table_name,
    COUNT(*) AS remaining_count
FROM note_attachments
UNION ALL
SELECT 
    'employees' AS table_name,
    COUNT(*) AS remaining_count
FROM employees
UNION ALL
SELECT 
    'management_accounts' AS table_name,
    COUNT(*) AS remaining_count
FROM management_accounts;

-- Thông báo
DO $$
BEGIN
    RAISE NOTICE 'Đã xóa toàn bộ service requests, notes và attachments.';
    RAISE NOTICE 'Giữ lại: employees và management_accounts';
END $$;

