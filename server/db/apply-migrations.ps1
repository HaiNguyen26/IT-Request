# PowerShell script to apply all database migrations
# Make sure PostgreSQL is running and connection details are correct

$ErrorActionPreference = "Stop"

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Applying Database Migrations..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if environment variables are set
if (-not $env:PGHOST) { $env:PGHOST = "localhost" }
if (-not $env:PGPORT) { $env:PGPORT = "5432" }
if (-not $env:PGDATABASE) { $env:PGDATABASE = "it_request_tracking" }
if (-not $env:PGUSER) { $env:PGUSER = "postgres" }

Write-Host "Database: $env:PGDATABASE" -ForegroundColor Yellow
Write-Host "Host: $env:PGHOST" -ForegroundColor Yellow
Write-Host "Port: $env:PGPORT" -ForegroundColor Yellow
Write-Host "User: $env:PGUSER" -ForegroundColor Yellow
Write-Host ""

# Set encoding to UTF-8
$env:PGCLIENTENCODING = "UTF8"

# Prompt for password
$securePassword = Read-Host "Enter PostgreSQL password for user $env:PGUSER" -AsSecureString
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Green
Write-Host ""

# Apply all migrations
try {
    $migrationFile = Join-Path $scriptDir "migrate-all-fields.sql"
    
    # Read SQL file content
    $sqlContent = Get-Content $migrationFile -Raw -Encoding UTF8
    
    # Execute SQL
    $env:PGPASSWORD = $env:PGPASSWORD
    & psql -h $env:PGHOST -p $env:PGPORT -U $env:PGUSER -d $env:PGDATABASE -c $sqlContent
    
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "Migration completed successfully!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Red
    Write-Host "Migration failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "====================================" -ForegroundColor Red
    exit 1
}
finally {
    # Clear password from environment
    $env:PGPASSWORD = ""
}

Read-Host "Press Enter to exit"

