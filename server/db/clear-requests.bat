@echo off
REM Script xoa tat ca cac phieu yeu cau (Mock Data)
REM Usage: clear-requests.bat [DB_USER] [DB_NAME]

setlocal

REM Default values
if "%1"=="" (
    set DB_USER=postgres
) else (
    set DB_USER=%1
)

if "%2"=="" (
    set DB_NAME=it_request
) else (
    set DB_NAME=%2
)

REM Password
set PASSWORD=Hainguyen261097

echo ==========================================
echo XOA TAT CA PHIEU YEU CAU (MOCK DATA)
echo ==========================================
echo.
echo Database User: %DB_USER%
echo Database Name: %DB_NAME%
echo.

REM Navigate to script directory
cd /d "%~dp0"

REM Set encoding
set PGPASSWORD=%PASSWORD%
set PGCLIENTENCODING=UTF8

echo Dang xoa tat ca service requests va request notes...
psql -U %DB_USER% -d %DB_NAME% -f clear-requests.sql --set=client_encoding=UTF8

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo DA XOA THANH CONG!
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo LOI! Vui long kiem tra lai.
    echo ==========================================
    exit /b 1
)

endlocal

