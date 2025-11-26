-- Script xóa tất cả các phiếu yêu cầu và ghi chú (Mock Data)
-- Chạy script này để làm sạch database trước khi sử dụng dữ liệu thật

-- Set encoding
SET client_encoding = 'UTF8';

-- Xóa tất cả ghi chú trước (vì có foreign key constraint)
DELETE FROM request_notes;

-- Xóa tất cả phiếu yêu cầu
DELETE FROM service_requests;

-- Reset sequence (nếu có)
-- ALTER SEQUENCE service_requests_id_seq RESTART WITH 1;
-- ALTER SEQUENCE request_notes_id_seq RESTART WITH 1;

-- Hiển thị thông báo
DO $$
BEGIN
    RAISE NOTICE 'Đã xóa tất cả phiếu yêu cầu và ghi chú từ database.';
END $$;

-- Kiểm tra kết quả
SELECT 
    'service_requests' as table_name,
    COUNT(*) as remaining_count
FROM service_requests
UNION ALL
SELECT 
    'request_notes' as table_name,
    COUNT(*) as remaining_count
FROM request_notes;

