@echo off
REM Script để chạy schema.sql vào PostgreSQL trên Windows
REM Usage: run-schema.bat [username] [database]

set USER=%~1
if "%USER%"=="" set USER=postgres

set DB=%~2
if "%DB%"=="" set DB=it_request

set PASSWORD=Hainguyen261097

echo Đang chạy schema.sql cho database: %DB% với user: %USER%
echo Password: %PASSWORD%

set PGPASSWORD=%PASSWORD%
set PGCLIENTENCODING=UTF8
psql -U %USER% -d %DB% -f schema.sql

if %ERRORLEVEL% EQU 0 (
    echo ✅ Schema đã được tạo thành công!
    echo.
    echo Bước tiếp theo: Chạy seed.sql để import mock data:
    echo seed.bat %USER% %DB%
) else (
    echo ❌ Có lỗi xảy ra khi chạy schema
    exit /b 1
)

