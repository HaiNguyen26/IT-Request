@echo off
REM Script backup database PostgreSQL trên Windows
REM Sử dụng: backup-database.bat [database_name] [output_file]

setlocal

set DATABASE_NAME=%~1
if "%DATABASE_NAME%"=="" set DATABASE_NAME=it_request

set DB_USER=%~2
if "%DB_USER%"=="" set DB_USER=postgres

set DB_PASSWORD=%~3
if "%DB_PASSWORD%"=="" set DB_PASSWORD=Hainguyen261097

set OUTPUT_FILE=%~4
if "%OUTPUT_FILE%"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set timestamp=%datetime:~0,8%_%datetime:~8,6%
    set OUTPUT_FILE=it_request_tracking_backup_%timestamp%.sql
)

echo ==========================================
echo   Backup PostgreSQL Database
echo ==========================================
echo.
echo Database: %DATABASE_NAME%
echo Output file: %OUTPUT_FILE%
echo.

REM Set environment variables
set PGPASSWORD=%DB_PASSWORD%
set PGCLIENTENCODING=UTF8

REM Backup database
echo Backing up database...
pg_dump -U %DB_USER% -d %DATABASE_NAME% -F p -f "%OUTPUT_FILE%" --verbose

if exist "%OUTPUT_FILE%" (
    echo.
    echo ==========================================
    echo   Backup completed successfully!
    echo ==========================================
    echo.
    echo File: %OUTPUT_FILE%
    echo.
    echo Next steps:
    echo   1. Upload file to server: scp %OUTPUT_FILE% root@27.71.16.15:/root/
    echo   2. Restore on server (see restore-database.sh)
    echo.
) else (
    echo.
    echo Error: Backup file was not created.
    exit /b 1
)

REM Clear password
set PGPASSWORD=
endlocal

