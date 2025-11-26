# Script backup database PostgreSQL trên Windows
# Sử dụng: .\backup-database.ps1 [database_name] [output_file]

param(
    [string]$DatabaseName = "it_request",  # Tên database mặc định trên local
    [string]$User = "postgres",
    [string]$Password = "Hainguyen261097",
    [string]$OutputFile = ""
)

# Tạo tên file backup nếu không chỉ định
if ([string]::IsNullOrEmpty($OutputFile)) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $OutputFile = "it_request_tracking_backup_$timestamp.sql"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Backup PostgreSQL Database" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: $DatabaseName" -ForegroundColor Yellow
Write-Host "Output file: $OutputFile" -ForegroundColor Yellow
Write-Host ""

# Set environment variables
$env:PGPASSWORD = $Password
$env:PGCLIENTENCODING = "UTF8"

# Kiểm tra pg_dump có sẵn không
$pgDumpPath = "pg_dump"
try {
    $null = Get-Command pg_dump -ErrorAction Stop
}
catch {
    Write-Host "Error: pg_dump not found. Please add PostgreSQL bin directory to PATH." -ForegroundColor Red
    Write-Host "Default location: C:\Program Files\PostgreSQL\<version>\bin" -ForegroundColor Yellow
    exit 1
}

# Backup database
Write-Host "Backing up database..." -ForegroundColor Yellow
try {
    pg_dump -U $User -d $DatabaseName -F p -f $OutputFile --verbose
    
    if (Test-Path $OutputFile) {
        $fileSize = (Get-Item $OutputFile).Length / 1MB
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "  Backup completed successfully!" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "File: $OutputFile" -ForegroundColor Green
        Write-Host "Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Upload file to server: scp $OutputFile root@27.71.16.15:/root/" -ForegroundColor Cyan
        Write-Host "  2. Restore on server (see restore-database.sh)" -ForegroundColor Cyan
    }
    else {
        Write-Host "Error: Backup file was not created." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Error: Failed to backup database." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
finally {
    # Clear password
    $env:PGPASSWORD = ""
}

