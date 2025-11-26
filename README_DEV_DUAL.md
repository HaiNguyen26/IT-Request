# Chạy Song Song 2 Account với dev:dual

## Mô tả
Script `npm run dev:dual` cho phép chạy song song 2 instance của webapp trên 2 port khác nhau để test với 2 account khác nhau cùng lúc.

## Cách sử dụng

### 1. Chạy tất cả (Server + 2 Webapp instances)
```bash
npm run dev:dual
```

Script này sẽ:
- ✅ Chạy server trên port **4000** (shared cho cả 2 instance)
- ✅ Chạy webapp instance 1 trên port **5173**
- ✅ Chạy webapp instance 2 trên port **5174**

### 2. Các URL sẽ được mở
- **Instance 1**: http://localhost:5173
- **Instance 2**: http://localhost:5174
- **API Server**: http://localhost:4000/api

### 3. Test với 2 account khác nhau
Bạn có thể:
- Mở 2 trình duyệt (hoặc 2 cửa sổ)
- Đăng nhập 2 account khác nhau:
  - **Instance 1**: Employee/IT Manager/Leadership account 1
  - **Instance 2**: Employee/IT Manager/Leadership account 2

## Các script có sẵn

### Chạy riêng lẻ:
```bash
# Chạy server
npm run dev:server

# Chạy webapp trên port mặc định (5173)
npm run dev:web

# Chạy webapp trên port 5174
npm run dev:web:port2
```

### Chạy song song:
```bash
# Chạy server + 1 webapp (port 5173)
npm run dev

# Chạy server + 2 webapp (port 5173 + 5174)
npm run dev:dual
```

## Lưu ý

1. **Cùng database**: Cả 2 instance webapp đều kết nối đến cùng 1 server và database, nên mọi thay đổi sẽ được đồng bộ.

2. **Hot Reload**: Cả 2 instance đều có hot reload, khi sửa code, cả 2 sẽ tự động reload.

3. **Port conflict**: Nếu port 5173 hoặc 5174 đã được sử dụng, Vite sẽ tự động tìm port trống tiếp theo.

4. **Console output**: Output sẽ có màu sắc khác nhau:
   - `SERVER` - Cyan
   - `WEBAPP-5173` - Green
   - `WEBAPP-5174` - Yellow

## Troubleshooting

### Port đã được sử dụng
Nếu gặp lỗi port đã được sử dụng:
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :5173
netstat -ano | findstr :5174
netstat -ano | findstr :4000

# Hoặc sử dụng PowerShell
Get-NetTCPConnection -LocalPort 5173,5174,4000
```

### Thay đổi port
Nếu muốn thay đổi port, sửa trong `webapp/package.json`:
```json
{
  "scripts": {
    "dev:port2": "vite --port 5175"  // Thay 5174 thành port khác
  }
}
```

