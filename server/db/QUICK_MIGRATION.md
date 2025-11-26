# Quick Migration Guide - Fix "column does not exist" Error

## Problem
Error: `column "estimated_cost" of relation "service_requests" does not exist`

## Solution - Run Migration in PowerShell

### Option 1: Run Batch File (Easiest)
```powershell
cd "D:\IT- Request tracking\server\db"
.\apply-migrations.bat
```

**Note:** In PowerShell, you MUST use `.\` before the filename!

### Option 2: Run SQL Directly
```powershell
cd "D:\IT- Request tracking\server\db"
$env:PGPASSWORD = "your_password_here"
psql -h localhost -U postgres -d it_request_tracking -f migrate-all-fields.sql
```

Or if you want to be prompted for password:
```powershell
cd "D:\IT- Request tracking\server\db"
psql -h localhost -U postgres -d it_request_tracking -f migrate-all-fields.sql
```

### Option 3: Use PowerShell Script
```powershell
cd "D:\IT- Request tracking\server\db"
.\apply-migrations.ps1
```

## What the Migration Does
- Adds `estimated_cost` and `confirmed_cost` columns to `service_requests` table
- Adds `note_type` and `parent_note_id` columns to `request_notes` table
- Creates necessary indexes for performance

## After Migration
Once completed, restart your application server and the error should be resolved!

