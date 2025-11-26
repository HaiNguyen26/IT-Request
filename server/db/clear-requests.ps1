# Script xoa tat ca cac phieu yeu cau (Mock Data)
# Usage: .\clear-requests.ps1 [-DB_USER postgres] [-DB_NAME it_request]

param(
    [string]$DB_USER = "postgres",
    [string]$DB_NAME = "it_request"
)

$PASSWORD = "Hainguyen261097"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "XOA TAT CA PHIEU YEU CAU (MOCK DATA)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database User: $DB_USER"
Write-Host "Database Name: $DB_NAME"
Write-Host ""

# Navigate to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Set encoding
$env:PGPASSWORD = $PASSWORD
$env:PGCLIENTENCODING = "UTF8"

Write-Host "Dang xoa tat ca service requests va request notes..." -ForegroundColor Yellow

$result = & psql -U $DB_USER -d $DB_NAME -f clear-requests.sql --set=client_encoding=UTF8 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "DA XOA THANH CONG!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "LOI! Vui long kiem tra lai." -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

