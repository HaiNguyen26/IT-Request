@echo off
chcp 65001 >nul
echo ========================================
echo Tạo lại tài khoản IT và Leadership
echo ========================================
echo.

set /p DB_USER="Nhập username PostgreSQL (mặc định: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

set /p DB_NAME="Nhập tên database (mặc định: it_request): "
if "%DB_NAME%"=="" set DB_NAME=it_request

set PASSWORD=Hainguyen261097

echo.
echo Đang tạo lại tài khoản IT và Leadership...
echo Password PostgreSQL: %PASSWORD%
echo.

cd /d "%~dp0"

REM Set encoding và password
set PGPASSWORD=%PASSWORD%
set PGCLIENTENCODING=UTF8

REM Chạy SQL với encoding UTF8
psql -U %DB_USER% -d %DB_NAME% -f "create-management-accounts.sql" --set=client_encoding=UTF8

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Đã tạo lại tài khoản thành công!
    echo ========================================
    echo.
    echo Tài khoản IT Manager:
    echo   Username: it
    echo   Password: RMG123@
    echo.
    echo Tài khoản Leadership:
    echo   Username: leadership
    echo   Password: RMG123@
    echo.
) else (
    echo.
    echo ========================================
    echo Có lỗi xảy ra khi tạo tài khoản!
    echo ========================================
    echo.
)

pause

