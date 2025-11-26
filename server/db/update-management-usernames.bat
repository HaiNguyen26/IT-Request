@echo off
REM Script cập nhật username từ trunghai/thanhtung sang tên đầy đủ (Windows Batch)
REM Sử dụng: update-management-usernames.bat [database_name] [user]

setlocal

set DATABASE_NAME=%1
if "%DATABASE_NAME%"=="" set DATABASE_NAME=it_request

set POSTGRES_USER=%2
if "%POSTGRES_USER%"=="" set POSTGRES_USER=postgres

echo ==========================================
echo   Update Management Account Usernames
echo ==========================================
echo.
echo Database: %DATABASE_NAME%
echo User: %POSTGRES_USER%
echo.
echo This will update:
echo   - IT Manager: trunghai -^> nguyễn trung hải
echo   - Leadership: thanhtung -^> lê thanh tùng
echo.

set /p CONFIRM="Are you sure? (yes/no): "
if not "%CONFIRM%"=="yes" (
    echo Cancelled.
    exit /b 0
)

echo.
echo Updating usernames...

psql -U %POSTGRES_USER% -d %DATABASE_NAME% -c "UPDATE management_accounts SET username = 'nguyễn trung hải', updated_at = NOW() WHERE username = 'trunghai' AND role = 'itManager';"

psql -U %POSTGRES_USER% -d %DATABASE_NAME% -c "UPDATE management_accounts SET username = 'lê thanh tùng', updated_at = NOW() WHERE username = 'thanhtung' AND role = 'leadership';"

echo.
echo Verifying updates...
psql -U %POSTGRES_USER% -d %DATABASE_NAME% -c "SELECT role, username, display_name, email FROM management_accounts ORDER BY role;"

echo.
echo ==========================================
echo   Done!
echo ==========================================
echo.
echo Usernames have been updated.
echo.

endlocal

