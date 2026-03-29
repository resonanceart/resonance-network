-- Add pdf_documents column to profile_extended
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS pdf_documents jsonb DEFAULT '[]'::jsonb;
