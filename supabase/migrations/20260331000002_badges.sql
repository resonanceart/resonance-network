-- Add badges array to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';
