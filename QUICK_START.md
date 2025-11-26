# Hướng Dẫn Chạy Ứng Dụng - Quick Start

## ⚠️ Lưu Ý Quan Trọng

**Phải chạy `npm run dev` từ thư mục GỐC của project**, không phải từ `server/db`!

## Các Bước Chạy Ứng Dụng

### Bước 1: Di chuyển vào thư mục gốc
```powershell
# Từ bất kỳ đâu, di chuyển vào thư mục gốc
cd "D:\IT- Request tracking"
```

### Bước 2: Kiểm tra dependencies đã cài đặt chưa
```powershell
# Cài đặt dependencies cho cả server và webapp
npm install
```

### Bước 3: Kiểm tra file .env

**File `server/.env`:**
```
DATABASE_URL=postgres://postgres:Hainguyen261097@localhost:5432/it_request
PORT=4000
```

**File `webapp/.env`:**
```
VITE_API_URL=http://localhost:4000/api
```

### Bước 4: Chạy ứng dụng

**Cách 1: Chạy cả server và webapp cùng lúc (KHUYẾN NGHỊ)**
```powershell
# Từ thư mục gốc
npm run dev
```

Lệnh này sẽ:
- Chạy backend server tại `http://localhost:4000`
- Chạy frontend webapp tại `http://localhost:5173` (hoặc port khác nếu 5173 bận)

**Cách 2: Chạy riêng từng phần**

Terminal 1 - Backend:
```powershell
cd "D:\IT- Request tracking"
npm run dev:server
```

Terminal 2 - Frontend:
```powershell
cd "D:\IT- Request tracking"
npm run dev:web
```

---

## Kiểm Tra Kết Quả

### Backend Server:
- Mở trình duyệt: `http://localhost:4000/health`
- Nếu thấy `{"status":"ok"}` → Backend đang chạy ✅

### Frontend Webapp:
- Mở trình duyệt: `http://localhost:5173` (hoặc port hiển thị trong terminal)
- Nếu thấy trang đăng nhập → Frontend đang chạy ✅

---

## Xử Lý Lỗi

### Lỗi: "concurrently is not recognized"
```powershell
# Cài đặt lại dependencies
npm install
```

### Lỗi: "Cannot find module"
```powershell
# Cài đặt dependencies cho từng phần
cd server
npm install

cd ../webapp
npm install
```

### Lỗi: "Port 4000 already in use"
- Đóng các ứng dụng đang dùng port 4000
- Hoặc thay đổi PORT trong `server/.env`

### Lỗi: "Failed to fetch" khi đăng nhập
- Kiểm tra backend server đang chạy: `http://localhost:4000/health`
- Kiểm tra `webapp/.env` có `VITE_API_URL=http://localhost:4000/api`

---

## Tài Khoản Đăng Nhập

### Employee (Nhân viên):
- Email: `nguyen.van.an@rmg123.com`
- Password: `RMG123@`

### IT Manager:
- Username: `it`
- Password: `RMG123@`

### Leadership:
- Username: `leadership`
- Password: `RMG123@`

---

## Lưu Ý

1. **Luôn chạy từ thư mục gốc**: `D:\IT- Request tracking`
2. **Không chạy từ `server/db`**: Đó là thư mục database scripts
3. **Backend phải chạy trước**: Frontend cần kết nối đến backend API
4. **Kiểm tra database đã có dữ liệu**: Chạy `server/db/verify-data.bat` để kiểm tra

