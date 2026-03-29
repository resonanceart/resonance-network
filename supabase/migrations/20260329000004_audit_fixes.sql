-- Audit fixes: missing columns, indexes, and RLS policies

-- Fix #1 & #14: Add welcome_email_sent column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false;

-- Fix #21: Add index on project_submissions.user_id
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON project_submissions(user_id);

-- Fix #22: Add index on collaboration_interest.user_id
CREATE INDEX IF NOT EXISTS idx_collaboration_interest_user_id ON collaboration_interest(user_id);

-- Fix #23: Add index on user_messages.recipient_id
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient_id ON user_messages(recipient_id);

-- Fix #20: Add RLS policies for collaboration_interest
ALTER TABLE collaboration_interest ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Collaboration interests are publicly readable"
    ON collaboration_interest FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can submit collaboration interest"
    ON collaboration_interest FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fix: Add index on profile_messages.to_profile_id
CREATE INDEX IF NOT EXISTS idx_profile_messages_to_profile ON profile_messages(to_profile_id);

-- Fix: Add index on feature_requests.user_id (if table exists)
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id ON feature_requests(user_id);
