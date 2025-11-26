@echo off
REM Script to apply database indexes for optimizing Leadership Dashboard performance
REM Usage: apply-dashboard-indexes.bat [password]

cd /d "%~dp0"

if "%1"=="" (
    echo Usage: apply-dashboard-indexes.bat ^<password^>
    echo Example: apply-dashboard-indexes.bat MyPassword123
    exit /b 1
)

set PASSWORD=%1
set PGCLIENTENCODING=UTF8

echo Applying dashboard optimization indexes...
echo.

psql -h localhost -U postgres -d it_request_tracking -c "\i optimize-dashboard-indexes.sql" --set=PASSWORD=%PASSWORD%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Dashboard indexes applied successfully!
) else (
    echo.
    echo ✗ Failed to apply indexes. Please check the error above.
    exit /b 1
)

