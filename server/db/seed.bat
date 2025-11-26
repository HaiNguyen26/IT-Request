@echo off
REM Script để chạy seed data vào PostgreSQL trên Windows
REM Usage: seed.bat [username] [database]

set USER=%~1
if "%USER%"=="" set USER=postgres

set DB=%~2
if "%DB%"=="" set DB=it_request

set PASSWORD=Hainguyen261097

echo Đang chạy seed data cho database: %DB% với user: %USER%
echo Password: %PASSWORD%

set PGPASSWORD=%PASSWORD%
set PGCLIENTENCODING=UTF8

echo Setting UTF-8 encoding and running seed.sql...
psql -U %USER% -d %DB% -f seed.sql --set=client_encoding=UTF8

if %ERRORLEVEL% EQU 0 (
    echo ✅ Seed data đã được import thành công!
) else (
    echo ❌ Có lỗi xảy ra khi import seed data
    exit /b 1
)

