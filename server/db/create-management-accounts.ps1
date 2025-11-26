# Script PowerShell để tạo lại tài khoản IT và Leadership
# Usage: .\create-management-accounts.ps1 [username] [database]

param(
    [string]$DB_USER = "postgres",
    [string]$DB_NAME = "it_request"
)

$PASSWORD = "Hainguyen261097"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tạo lại tài khoản IT và Leadership" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Database: $DB_NAME" -ForegroundColor Yellow
Write-Host "User: $DB_USER" -ForegroundColor Yellow
Write-Host "Password PostgreSQL: $PASSWORD" -ForegroundColor Yellow
Write-Host ""

# Set encoding và password
$env:PGPASSWORD = $PASSWORD
$env:PGCLIENTENCODING = "UTF8"

# Lấy đường dẫn thư mục chứa script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptPath "create-management-accounts.sql"

Write-Host "Đang tạo lại tài khoản IT và Leadership..." -ForegroundColor Green
Write-Host ""

# Chạy SQL
& psql -U $DB_USER -d $DB_NAME -f $sqlFile --set=client_encoding=UTF8

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Đã tạo lại tài khoản thành công!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tài khoản IT Manager:" -ForegroundColor Cyan
    Write-Host "  Username: it" -ForegroundColor White
    Write-Host "  Password: RMG123@" -ForegroundColor White
    Write-Host ""
    Write-Host "Tài khoản Leadership:" -ForegroundColor Cyan
    Write-Host "  Username: leadership" -ForegroundColor White
    Write-Host "  Password: RMG123@" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Có lỗi xảy ra khi tạo tài khoản!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
}

# Xóa password khỏi environment variable
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

