@echo off
REM Script to verify mock data has been imported successfully
REM Usage: verify-data.bat [username] [database]

set USER=%~1
if "%USER%"=="" set USER=postgres

set DB=%~2
if "%DB%"=="" set DB=it_request

set PASSWORD=Hainguyen261097

echo Verifying mock data in database: %DB%
echo.

set PGPASSWORD=%PASSWORD%
set PGCLIENTENCODING=UTF8

psql -U %USER% -d %DB% -f verify-data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Verification complete!
) else (
    echo.
    echo ERROR: Failed to verify data
    exit /b 1
)



