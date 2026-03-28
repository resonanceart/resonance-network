-- Add missing columns to profile_extended
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS past_work jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS bio_excerpt text;
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS professional_title text;
