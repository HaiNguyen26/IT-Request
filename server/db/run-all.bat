@echo off
REM Script để chạy cả schema.sql và seed.sql vào PostgreSQL trên Windows
REM Usage: run-all.bat [username] [database]

set USER=%~1
if "%USER%"=="" set USER=postgres

set DB=%~2
if "%DB%"=="" set DB=it_request

set PASSWORD=Hainguyen261097

echo ========================================
echo Đang setup database: %DB% với user: %USER%
echo ========================================
echo.

set PGPASSWORD=%PASSWORD%
set PGCLIENTENCODING=UTF8

echo [1/2] Đang chạy schema.sql...
psql -U %USER% -d %DB% -f schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Lỗi khi chạy schema.sql
    exit /b 1
)

echo.
echo [2/2] Running seed.sql with UTF-8 encoding...
set PGCLIENTENCODING=UTF8
psql -U %USER% -d %DB% -f seed.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Lỗi khi chạy seed.sql
    exit /b 1
)

echo.
echo ========================================
echo ✅ Đã setup database thành công!
echo ========================================
echo.
echo Test Accounts:
echo - User: nguyen.van.an@rmg123.com / RMG123@
echo - IT Manager: it / RMG123@
echo - Leadership: leadership / RMG123@

