-- Script để xóa toàn bộ phiếu yêu cầu và dữ liệu liên quan
-- Chạy script này để reset toàn bộ service requests

-- Xóa tất cả file attachments trước (vì có foreign key đến request_notes)
DELETE FROM note_attachments;

-- Xóa tất cả notes (vì có foreign key đến service_requests)
DELETE FROM request_notes;

-- Xóa tất cả service requests
DELETE FROM service_requests;

-- Kiểm tra số lượng còn lại
SELECT 
    (SELECT COUNT(*) FROM service_requests) AS service_requests_count,
    (SELECT COUNT(*) FROM request_notes) AS request_notes_count,
    (SELECT COUNT(*) FROM note_attachments) AS note_attachments_count;

