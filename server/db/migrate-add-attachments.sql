-- Migration script to add note_attachments table
-- Run this script if your database already exists and needs to be updated

-- Create note_attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES request_notes(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_note_attachments_note_id ON note_attachments(note_id);

-- Verify the table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'note_attachments';

