# Script kiểm tra database có tồn tại không
# Sử dụng: .\check-database.ps1 [database_name]

param(
    [string]$DatabaseName = "",
    [string]$User = "postgres",
    [string]$Password = "Hainguyen261097"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Check PostgreSQL Databases" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:PGPASSWORD = $Password
$env:PGCLIENTENCODING = "UTF8"

# Liệt kê tất cả databases
Write-Host "Available databases:" -ForegroundColor Yellow
psql -U $User -l

Write-Host ""

# Nếu có chỉ định tên database, kiểm tra cụ thể
if ($DatabaseName) {
    Write-Host "Checking database: $DatabaseName" -ForegroundColor Yellow
    
    $result = psql -U $User -lqt | Select-String -Pattern "^\s*$DatabaseName\s*\|"
    
    if ($result) {
        Write-Host "✓ Database '$DatabaseName' exists" -ForegroundColor Green
        
        # Kiểm tra số lượng records
        Write-Host ""
        Write-Host "Database statistics:" -ForegroundColor Yellow
        psql -U $User -d $DatabaseName -c "
        SELECT 
            'employees' AS table_name, COUNT(*) AS count FROM employees
        UNION ALL
        SELECT 'service_requests', COUNT(*) FROM service_requests
        UNION ALL
        SELECT 'request_notes', COUNT(*) FROM request_notes
        UNION ALL
        SELECT 'management_accounts', COUNT(*) FROM management_accounts;
        " 2>$null
    }
    else {
        Write-Host "✗ Database '$DatabaseName' does NOT exist" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common database names:" -ForegroundColor Yellow
        Write-Host "  - it_request" -ForegroundColor Cyan
        Write-Host "  - it_request_tracking" -ForegroundColor Cyan
    }
}

# Clear password
$env:PGPASSWORD = ""

