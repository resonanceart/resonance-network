-- Content blocks for block-based profile system
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS content_blocks jsonb DEFAULT '[]'::jsonb;
