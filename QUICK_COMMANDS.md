# Lệnh Nhanh - Server Ubuntu

## Xóa file backup cũ

```bash
# SSH vào server
ssh root@27.71.16.15

# Xóa file backup cụ thể
rm /root/it_request_tracking_backup_20251126_152326.sql

# Hoặc xóa tất cả file backup cũ (giữ lại file mới nhất)
# Cẩn thận khi dùng lệnh này
rm /root/it_request_tracking_backup_*.sql
```

## Kiểm tra file trước khi xóa

```bash
# Xem danh sách file backup
ls -lh /root/it_request_tracking_backup_*.sql

# Xem thông tin chi tiết
stat /root/it_request_tracking_backup_20251126_152326.sql
```

