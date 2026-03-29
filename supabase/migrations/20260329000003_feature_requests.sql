-- Feature requests table
CREATE TABLE IF NOT EXISTS feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view their own requests
CREATE POLICY "Users can view own feature requests"
  ON feature_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone authenticated can insert
CREATE POLICY "Users can submit feature requests"
  ON feature_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all (service role bypasses RLS)
