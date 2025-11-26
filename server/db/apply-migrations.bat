@echo off
REM Script to apply all database migrations (cost fields and note types)
REM Usage: apply-migrations.bat [password]

cd /d "%~dp0"

set PGCLIENTENCODING=UTF8

echo ====================================
echo Applying Database Migrations...
echo ====================================
echo.
echo Adding estimated_cost and confirmed_cost to service_requests...
echo Adding note_type and parent_note_id to request_notes...
echo Creating note_attachments table for file attachments...
echo.

set DB=it_request
set USER=postgres
set PASSWORD=Hainguyen261097

if "%1"=="" (
    set PGPASSWORD=%PASSWORD%
    psql -h localhost -U %USER% -d %DB% -f migrate-all-fields.sql
) else (
    set PGPASSWORD=%1
    psql -h localhost -U %USER% -d %DB% -f migrate-all-fields.sql
    set PGPASSWORD=
)
set PGPASSWORD=

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Migration completed successfully!
    echo ====================================
    echo.
    echo The following fields have been added:
    echo   - service_requests.estimated_cost
    echo   - service_requests.confirmed_cost
    echo   - request_notes.note_type
    echo   - request_notes.parent_note_id
    echo   - note_attachments table (for file attachments)
    echo.
) else (
    echo.
    echo ====================================
    echo Migration failed! Please check the error above.
    echo ====================================
    pause
    exit /b 1
)

pause

