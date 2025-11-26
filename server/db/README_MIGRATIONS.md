# Database Migrations

## Overview
This directory contains migration scripts to update your existing database with new fields that were added in recent updates.

## Required Migrations

### 1. Cost Fields Migration
Adds `estimated_cost` and `confirmed_cost` columns to `service_requests` table for managing equipment purchase costs.

### 2. Note Type Migration  
Adds `note_type` and `parent_note_id` columns to `request_notes` table for supporting employee requests and responses.

## How to Apply Migrations

### Option 1: Using Batch Script (Windows CMD)
```cmd
cd server\db
apply-migrations.bat [password]
```

Example:
```cmd
apply-migrations.bat MyPassword123
```

If you don't provide the password, you'll be prompted to enter it securely.

### Option 2: Using PowerShell Script (Windows PowerShell)
```powershell
cd server\db
.\apply-migrations.ps1
```

### Option 3: Manual SQL Execution
```cmd
cd server\db
psql -h localhost -U postgres -d it_request_tracking -f migrate-all-fields.sql
```

## What Gets Added

### service_requests table:
- `estimated_cost` (NUMERIC) - Estimated cost proposed by employee
- `confirmed_cost` (NUMERIC) - Confirmed cost by IT Manager

### request_notes table:
- `note_type` (ENUM) - Type of note: 'normal', 'employee_request', 'employee_response'
- `parent_note_id` (UUID) - Links employee responses to IT requests

## Verification

After running migrations, you can verify the changes:

```sql
-- Check service_requests columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_requests' 
  AND column_name IN ('estimated_cost', 'confirmed_cost');

-- Check request_notes columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'request_notes' 
  AND column_name IN ('note_type', 'parent_note_id');
```

## Notes

- All migrations use `IF NOT EXISTS` checks, so they're safe to run multiple times
- Existing data will not be affected
- The migrations are backward compatible

