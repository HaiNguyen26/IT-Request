# Script cập nhật username từ trunghai/thanhtung sang tên đầy đủ (Windows PowerShell)
# Sử dụng: .\update-management-usernames.ps1 [database_name] [user]

param(
    [string]$DatabaseName = "it_request",
    [string]$PostgresUser = "postgres"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Update Management Account Usernames" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: $DatabaseName" -ForegroundColor Yellow
Write-Host "User: $PostgresUser" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will update:" -ForegroundColor Yellow
Write-Host "  - IT Manager: trunghai -> nguyễn trung hải" -ForegroundColor Yellow
Write-Host "  - Leadership: thanhtung -> lê thanh tùng" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Are you sure? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Red
    exit 0
}

# Lấy mật khẩu
$password = Read-Host "Enter PostgreSQL password for user $PostgresUser" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $plainPassword

Write-Host ""
Write-Host "Updating usernames..." -ForegroundColor Green

# Cập nhật username
$updateQuery = @"
UPDATE management_accounts
SET username = 'nguyễn trung hải',
    updated_at = NOW()
WHERE username = 'trunghai' AND role = 'itManager';

UPDATE management_accounts
SET username = 'lê thanh tùng',
    updated_at = NOW()
WHERE username = 'thanhtung' AND role = 'leadership';

SELECT 
    role,
    username,
    display_name,
    email
FROM management_accounts
ORDER BY role;
"@

$updateQuery | & psql -U $PostgresUser -d $DatabaseName

# Clear password
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Done!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Usernames have been updated." -ForegroundColor Green
Write-Host ""

