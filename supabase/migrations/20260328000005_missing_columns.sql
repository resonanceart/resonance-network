-- Add missing columns to profile_extended
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS professional_title text;
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS portfolio_pdf_url text;
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS media_links jsonb DEFAULT '[]'::jsonb;
