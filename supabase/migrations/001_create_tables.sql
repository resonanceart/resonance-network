-- Create project_submissions table
CREATE TABLE IF NOT EXISTS project_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  artist_name text NOT NULL,
  artist_bio text,
  artist_email text NOT NULL,
  artist_website text,
  artist_headshot_data text,
  project_title text NOT NULL,
  one_sentence text,
  vision text,
  experience text,
  story text,
  goals text,
  domains text[],
  pathways text[],
  stage text,
  scale text,
  location text,
  materials text,
  special_needs text,
  hero_image_data text,
  gallery_images_data text,
  collaboration_needs text,
  collaboration_role_count integer,
  status text DEFAULT 'new'
);

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
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_profiles ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated/anon users (forms submit via API routes with service key)
CREATE POLICY "Allow service role full access on project_submissions" ON project_submissions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on collaboration_interest" ON collaboration_interest
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on collaborator_profiles" ON collaborator_profiles
  FOR ALL USING (true) WITH CHECK (true);
