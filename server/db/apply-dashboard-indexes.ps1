# PowerShell script to apply database indexes for optimizing Leadership Dashboard performance
# Usage: .\apply-dashboard-indexes.ps1 [password]

param(
    [Parameter(Mandatory=$false)]
    [string]$Password
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

if (-not $Password) {
    Write-Host "Usage: .\apply-dashboard-indexes.ps1 -Password <password>" -ForegroundColor Yellow
    Write-Host "Example: .\apply-dashboard-indexes.ps1 -Password MyPassword123" -ForegroundColor Yellow
    exit 1
}

$env:PGPASSWORD = $Password
$env:PGCLIENTENCODING = "UTF8"

Write-Host "Applying dashboard optimization indexes..." -ForegroundColor Cyan
Write-Host ""

try {
    $result = psql -h localhost -U postgres -d it_request_tracking -f optimize-dashboard-indexes.sql 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Dashboard indexes applied successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Failed to apply indexes. Please check the error above." -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD
    Remove-Item Env:\PGCLIENTENCODING
}

