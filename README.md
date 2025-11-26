# IT Request Tracking

## Project Structure

- `server/` – Express + PostgreSQL REST API (TypeScript)
- `webapp/` – React + Vite frontend (TypeScript + Tailwind CSS)

## Prerequisites

- Node.js 18+
- PostgreSQL (accessible via pgAdmin or CLI)

## Quick Start

1. **Clone the repository** and open the project root.
2. **Install dependencies** (runs sub-project installs automatically):
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   - In `server/.env` (create from the template below):
     ```
     DATABASE_URL=postgres://postgres:Hainguyen261097@localhost:5432/it_request
     PORT=4000
     ```
   - In `webapp/.env` (create manually):
     ```
     VITE_API_URL=http://localhost:4000/api
     ```
4. **Prepare the database**:
   ```bash
   # Tạo database nếu chưa có:
   psql -U postgres -c "CREATE DATABASE it_request;"
   
   # Chạy schema với user postgres (khuyến nghị):
   psql -U postgres -d it_request -f server/db/schema.sql
   
   # Hoặc sử dụng script helper trên Windows:
   cd server/db
   run-schema.bat postgres it_request
   ```
   Password: `Hainguyen261097`
   
5. **Tạo tài khoản Management (nếu cần)**:
   ```bash
   # Tài khoản Management đã được tạo tự động trong schema.sql
   # Nếu cần tạo lại:
   cd server/db
   .\create-management-accounts.ps1
   
   # Hoặc:
   cd server/db
   create-management-accounts.bat
   
   # Thông tin tài khoản:
   # - IT Manager: username 'trunghai', password 'RMG123@'
   # - Leadership: username 'thanhtung', password 'RMG123@'
   ```
   
   **Lưu ý:** 
   - Tài khoản Management được tạo tự động trong `schema.sql`
   - Nhân viên sẽ được thêm vào database qua ứng dụng (import Excel hoặc tạo thủ công)
   - File `seed.sql` hiện tại để trống - không chứa mock data
   - Xem chi tiết tài khoản tại `server/db/ACCOUNTS.md`

6. **Xóa mock data (nếu có) - KHÔNG BẮT BUỘC**:
   ```bash
   # Nếu database có mock data về phiếu yêu cầu cũ, có thể xóa bằng:
   cd server/db
   $env:PGPASSWORD="Hainguyen261097"
   $env:PGCLIENTENCODING="UTF8"
   psql -U postgres -d it_request -f clear-requests.sql
   ```
   
   Script này sẽ xóa tất cả service requests và request notes trong database.
   
6. **Run the full stack**:
   ```bash
   npm run dev
   ```
   This starts the API on `http://localhost:4000` and the frontend on `http://localhost:5173` (default Vite port). The terminal will show both processes via `concurrently`.

## Useful Commands

- `npm run dev:server` – start only the Express API (watch mode)
- `npm run dev:web` – start only the React frontend
- `npm run build` – build both server and webapp for production
- `npm run lint` – run ESLint on the frontend source

## Deployment

### GitHub Repository
- Repository: https://github.com/HaiNguyen26/IT-Request.git
- Production Server: 27.71.16.15

### Deployment Guides
- **GITHUB_SETUP.md** - Hướng dẫn push code lên GitHub
- **DEPLOY_GITHUB.md** - Hướng dẫn deploy từ GitHub lên server
- **DEPLOY.md** - Hướng dẫn deploy chi tiết (cách cũ - upload trực tiếp)

### Quick Deploy từ GitHub
```bash
# Trên server
cd /var/www/it-request-tracking
git pull origin main
./deploy-from-github.sh
```

## Notes

- PostgreSQL superuser password in this environment: `Hainguyen261097`.
- The API expects the `employees`, `service_requests`, and `request_notes` tables from `server/db/schema.sql`.
- The frontend reads the API base URL from `VITE_API_URL`; adjust this when deploying.
- Database is managed locally, only code is version controlled via Git.

