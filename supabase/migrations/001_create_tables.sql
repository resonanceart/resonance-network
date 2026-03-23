-- Create collaboration_interest table
CREATE TABLE IF NOT EXISTS collaboration_interest (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  experience text NOT NULL,
  task_title text,
  project_title text,
  status text DEFAULT 'new'
);

-- Create collaborator_profiles table
CREATE TABLE IF NOT EXISTS collaborator_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  photo_url text,
  skills text NOT NULL,
  portfolio text,
  availability text,
  notes text,
  status text DEFAULT 'new'
);

-- Enable RLS but allow service role to bypass
ALTER TABLE collaboration_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_profiles ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated/anon users (forms submit via API routes with service key)
CREATE POLICY "Allow service role full access on collaboration_interest" ON collaboration_interest
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on collaborator_profiles" ON collaborator_profiles
  FOR ALL USING (true) WITH CHECK (true);
