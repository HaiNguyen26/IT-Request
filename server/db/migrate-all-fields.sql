-- Migration script to add all new fields to existing database
-- Run this script if your database already exists and needs to be updated

-- ============================================
-- 1. Add cost fields to service_requests
-- ============================================

-- Add estimated_cost column if it doesn't exist
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(15, 2);

-- Add confirmed_cost column if it doesn't exist
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS confirmed_cost NUMERIC(15, 2);

-- ============================================
-- 2. Add note type fields to request_notes
-- ============================================

-- Create note_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE note_type AS ENUM ('normal', 'employee_request', 'employee_response');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add note_type column if it doesn't exist
ALTER TABLE request_notes
ADD COLUMN IF NOT EXISTS note_type note_type NOT NULL DEFAULT 'normal';

-- Add parent_note_id column if it doesn't exist
ALTER TABLE request_notes
ADD COLUMN IF NOT EXISTS parent_note_id UUID REFERENCES request_notes(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_request_notes_parent ON request_notes(parent_note_id);
CREATE INDEX IF NOT EXISTS idx_request_notes_type ON request_notes(note_type);

-- ============================================
-- 3. Create note_attachments table for file attachments
-- ============================================

-- Create note_attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES request_notes(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_note_attachments_note_id ON note_attachments(note_id);

-- ============================================
-- 4. Verify the columns were added
-- ============================================

-- Verify service_requests columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_requests' 
  AND column_name IN ('estimated_cost', 'confirmed_cost');

-- Verify request_notes columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'request_notes' 
  AND column_name IN ('note_type', 'parent_note_id');

-- Verify note_attachments table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'note_attachments'
  AND column_name IN ('id', 'note_id', 'file_name', 'file_path', 'file_size', 'file_type', 'uploaded_by', 'created_at');

