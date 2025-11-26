# PowerShell script to convert seed.sql to UTF-8 encoding
# Usage: .\convert-to-utf8.ps1

$filePath = "seed.sql"

if (-not (Test-Path $filePath)) {
    Write-Host "ERROR: File $filePath not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Converting $filePath to UTF-8..." -ForegroundColor Yellow

try {
    # Read file with current encoding (usually Windows-1252 or UTF-8)
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    
    # Write back with UTF-8 without BOM
    [System.IO.File]::WriteAllText((Resolve-Path $filePath), $content, [System.Text.UTF8Encoding]::new($false))
    
    Write-Host "SUCCESS: Converted $filePath to UTF-8!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to convert: $_" -ForegroundColor Red
    exit 1
}
