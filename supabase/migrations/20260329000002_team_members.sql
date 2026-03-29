ALTER TABLE project_submissions ADD COLUMN IF NOT EXISTS team_members jsonb DEFAULT '[]'::jsonb;
