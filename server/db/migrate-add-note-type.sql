-- Migration script to add note_type and parent_note_id to existing request_notes table
-- Run this script if your database already exists and needs to be updated

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

-- Create index for parent_note_id
CREATE INDEX IF NOT EXISTS idx_request_notes_parent ON request_notes(parent_note_id);

-- Create index for note_type
CREATE INDEX IF NOT EXISTS idx_request_notes_type ON request_notes(note_type);

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'request_notes' 
  AND column_name IN ('note_type', 'parent_note_id');

