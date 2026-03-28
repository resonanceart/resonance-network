-- ============================================================
-- Migration: Work Experience
-- Adds work_experience table for employment, education, freelance entries
-- ============================================================

CREATE TABLE IF NOT EXISTS work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'employment',
  title text NOT NULL,
  organization text,
  location text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work experience viewable by everyone" ON work_experience
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = work_experience.profile_id AND profile_visibility = 'published')
  );

CREATE POLICY "Users can manage own work experience" ON work_experience
  FOR ALL USING (
    profile_id IN (SELECT id FROM user_profiles WHERE id = auth.uid())
  );

CREATE INDEX idx_work_experience_profile ON work_experience(profile_id);
