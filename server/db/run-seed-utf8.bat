@echo off
REM Script to run seed.sql with UTF-8 encoding on Windows
REM Usage: run-seed-utf8.bat [username] [database]

set USER=%~1
if "%USER%"=="" set USER=postgres

set DB=%~2
if "%DB%"=="" set DB=it_request

set PASSWORD=Hainguyen261097

echo Running seed.sql for database: %DB% with user: %USER%
echo Password: %PASSWORD%

set PGPASSWORD=%PASSWORD%
set PGCLIENTENCODING=UTF8

echo Converting seed.sql to UTF-8 first...
powershell -ExecutionPolicy Bypass -File convert-to-utf8.ps1

if %ERRORLEVEL% NEQ 0 (
    echo Warning: Failed to convert file encoding. Trying to run anyway...
)

echo.
echo Running seed.sql with UTF-8 client encoding...
psql -U %USER% -d %DB% -f seed.sql

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Seed data imported successfully!
) else (
    echo ERROR: Failed to import seed data
    echo.
    echo Try running this manually:
    echo   psql -U %USER% -d %DB% -f seed.sql
    exit /b 1
)



