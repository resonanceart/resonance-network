-- Add badges JSONB column to profile_extended for rich badge data
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;
