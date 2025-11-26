# Script PowerShell để xóa toàn bộ dữ liệu, chỉ giữ lại employees và management_accounts
# Sử dụng: .\clear-all-data.ps1 [database_name] [user] [password]

param(
    [string]$DatabaseName = "it_request_tracking",
    [string]$User = "postgres",
    [string]$Password = "Hainguyen261097"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Clear All Data (Keep Employees)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: $DatabaseName" -ForegroundColor Yellow
Write-Host "User: $User" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will DELETE:" -ForegroundColor Red
Write-Host "  - All service_requests"
Write-Host "  - All request_notes"
Write-Host "  - All note_attachments"
Write-Host ""
Write-Host "This will KEEP:" -ForegroundColor Green
Write-Host "  - All employees"
Write-Host "  - All management_accounts"
Write-Host ""

$confirm = Read-Host "Are you sure? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

# Set environment variables
$env:PGPASSWORD = $Password
$env:PGCLIENTENCODING = "UTF8"

# Lấy đường dẫn script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SqlFile = Join-Path $ScriptDir "clear-all-data-keep-employees.sql"

# Chạy SQL
Write-Host "Executing SQL script..." -ForegroundColor Yellow
psql -U $User -d $DatabaseName -f $SqlFile

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Done!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "All service requests, notes, and attachments have been deleted." -ForegroundColor Green
Write-Host "Employees and management accounts are preserved." -ForegroundColor Green
Write-Host ""

# Clear password
$env:PGPASSWORD = ""

