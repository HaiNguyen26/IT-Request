@echo off
REM Script batch để xóa toàn bộ dữ liệu, chỉ giữ lại employees và management_accounts
REM Sử dụng: clear-all-data.bat [database_name] [user] [password]

setlocal

set DATABASE_NAME=%~1
if "%DATABASE_NAME%"=="" set DATABASE_NAME=it_request_tracking

set DB_USER=%~2
if "%DB_USER%"=="" set DB_USER=postgres

set DB_PASSWORD=%~3
if "%DB_PASSWORD%"=="" set DB_PASSWORD=Hainguyen261097

echo ==========================================
echo   Clear All Data (Keep Employees)
echo ==========================================
echo.
echo Database: %DATABASE_NAME%
echo User: %DB_USER%
echo.
echo This will DELETE:
echo   - All service_requests
echo   - All request_notes
echo   - All note_attachments
echo.
echo This will KEEP:
echo   - All employees
echo   - All management_accounts
echo.

set /p CONFIRM="Are you sure? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo Cancelled.
    exit /b
)

REM Set environment variables
set PGPASSWORD=%DB_PASSWORD%
set PGCLIENTENCODING=UTF8

REM Lấy đường dẫn script
set SCRIPT_DIR=%~dp0
set SQL_FILE=%SCRIPT_DIR%clear-all-data-keep-employees.sql

REM Chạy SQL
echo Executing SQL script...
psql -U %DB_USER% -d %DATABASE_NAME% -f "%SQL_FILE%"

echo.
echo ==========================================
echo   Done!
echo ==========================================
echo.
echo All service requests, notes, and attachments have been deleted.
echo Employees and management accounts are preserved.
echo.

REM Clear password
set PGPASSWORD=
endlocal

