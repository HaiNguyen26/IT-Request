@echo off
REM Script để xóa toàn bộ phiếu yêu cầu và dữ liệu liên quan
REM Usage: clear-all-requests.bat [password]

cd /d "%~dp0"

set PGCLIENTENCODING=UTF8

echo ====================================
echo XÓA TOÀN BỘ PHIẾU YÊU CẦU...
echo ====================================
echo.
echo CẢNH BÁO: Script này sẽ xóa TẤT CẢ:
echo   - Service Requests (Phiếu yêu cầu)
echo   - Request Notes (Ghi chú)
echo   - Note Attachments (File đính kèm)
echo.
echo Bạn có chắc chắn muốn tiếp tục? (Y/N)
set /p confirm=
if /i not "%confirm%"=="Y" (
    echo Đã hủy!
    pause
    exit /b 0
)
echo.

set DB=it_request
set USER=postgres
set PASSWORD=Hainguyen261097

if "%1"=="" (
    set PGPASSWORD=%PASSWORD%
    psql -h localhost -U %USER% -d %DB% -f clear-all-requests.sql
) else (
    set PGPASSWORD=%1
    psql -h localhost -U %USER% -d %DB% -f clear-all-requests.sql
    set PGPASSWORD=
)
set PGPASSWORD=

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Đã xóa toàn bộ phiếu yêu cầu thành công!
    echo ====================================
    echo.
) else (
    echo.
    echo ====================================
    echo Xóa dữ liệu thất bại! Vui lòng kiểm tra lỗi ở trên.
    echo ====================================
    pause
    exit /b 1
)

pause

