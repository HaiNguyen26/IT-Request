-- Script to verify mock data has been imported successfully
-- Usage: psql -U postgres -d it_request -f verify-data.sql

-- 1. Count employees
SELECT 'Employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'Service Requests', COUNT(*) FROM service_requests
UNION ALL
SELECT 'Request Notes', COUNT(*) FROM request_notes
UNION ALL
SELECT 'Management Accounts', COUNT(*) FROM management_accounts;

-- 2. List employees
SELECT '=== EMPLOYEES ===' as info;
SELECT id, name, email, department FROM employees ORDER BY created_at LIMIT 10;

-- 3. List service requests by status
SELECT '=== SERVICE REQUESTS BY STATUS ===' as info;
SELECT status, COUNT(*) as count FROM service_requests GROUP BY status ORDER BY status;

-- 4. List management accounts
SELECT '=== MANAGEMENT ACCOUNTS ===' as info;
SELECT role, username, display_name, email FROM management_accounts;



