-- Migration script to add cost fields to existing service_requests table
-- Run this script if your database already exists and needs to be updated

-- Add estimated_cost column if it doesn't exist
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(15, 2);

-- Add confirmed_cost column if it doesn't exist
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS confirmed_cost NUMERIC(15, 2);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_requests' 
  AND column_name IN ('estimated_cost', 'confirmed_cost');

