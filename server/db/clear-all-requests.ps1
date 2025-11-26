# PowerShell script to delete all service requests
# Usage: .\clear-all-requests.ps1 [password]

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$env:PGCLIENTENCODING = "UTF8"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "XOA TOAN BO PHIEU YEU CAU..." -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "CANH BAO: Script nay se xoa TAT CA:" -ForegroundColor Red
Write-Host "  - Service Requests (Phieu yeu cau)" -ForegroundColor Red
Write-Host "  - Request Notes (Ghi chu)" -ForegroundColor Red
Write-Host "  - Note Attachments (File dinh kem)" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Ban co chac chan muon tiep tuc? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Da huy!" -ForegroundColor Yellow
    exit 0
}
Write-Host ""

$DB = "it_request"
$USER = "postgres"
$PASSWORD = if ($args.Count -gt 0) { $args[0] } else { "Hainguyen261097" }

$env:PGPASSWORD = $PASSWORD

try {
    $result = & psql -h localhost -U $USER -d $DB -f "clear-all-requests.sql" 2>&1
    $result | ForEach-Object { Write-Host $_ }
    
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "Da xoa toan bo phieu yeu cau thanh cong!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Red
    Write-Host "Xoa du lieu that bai! Vui long kiem tra loi o tren." -ForegroundColor Red
    Write-Host "====================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = ""
}

Write-Host "Hoan thanh! Nhan Enter de thoat..." -ForegroundColor Green
Read-Host
