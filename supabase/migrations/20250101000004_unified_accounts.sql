-- Unified Accounts: link submissions to user accounts
ALTER TABLE project_submissions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON project_submissions(user_id);

ALTER TABLE collaboration_interest
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_interest_user_id ON collaboration_interest(user_id);

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'draft'
  CHECK (profile_visibility IN ('draft', 'pending', 'published'));

-- Backfill user_ids from email matches
UPDATE project_submissions ps SET user_id = up.id
FROM user_profiles up WHERE ps.artist_email = up.email AND ps.user_id IS NULL;

UPDATE collaboration_interest ci SET user_id = up.id
FROM user_profiles up WHERE ci.email = up.email AND ci.user_id IS NULL;

-- RLS
CREATE POLICY "Users can view own project submissions" ON project_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own project submissions" ON project_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own collaboration interests" ON collaboration_interest FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_project_submissions_updated_at BEFORE UPDATE ON project_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
