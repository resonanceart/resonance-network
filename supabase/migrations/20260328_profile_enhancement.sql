-- ============================================================
-- Migration: Profile Enhancement (Phase 1 / P0)
-- Adds enhanced profile fields, social links, skills, tools,
-- portfolio projects, content blocks, and profile messages.
-- ============================================================

-- ─── ALTER profile_extended ─────────────────────────────────────

ALTER TABLE profile_extended
  ADD COLUMN IF NOT EXISTS pronouns text,
  ADD COLUMN IF NOT EXISTS location_secondary text,
  ADD COLUMN IF NOT EXISTS artist_statement text,
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS cover_position jsonb,
  ADD COLUMN IF NOT EXISTS availability_types text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_website_url text,
  ADD COLUMN IF NOT EXISTS primary_website_label text,
  ADD COLUMN IF NOT EXISTS cta_primary_label text,
  ADD COLUMN IF NOT EXISTS cta_primary_action text,
  ADD COLUMN IF NOT EXISTS cta_primary_url text,
  ADD COLUMN IF NOT EXISTS cta_secondary_label text,
  ADD COLUMN IF NOT EXISTS cta_secondary_action text,
  ADD COLUMN IF NOT EXISTS cta_secondary_url text,
  ADD COLUMN IF NOT EXISTS section_order text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS section_visibility jsonb,
  ADD COLUMN IF NOT EXISTS gallery_layout text DEFAULT 'masonry',
  ADD COLUMN IF NOT EXISTS gallery_columns int DEFAULT 3;

-- ─── Profile Social Links ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_social_links_profile_id ON profile_social_links(profile_id);

ALTER TABLE profile_social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social links are publicly readable"
  ON profile_social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own social links"
  ON profile_social_links FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ─── Profile Skills ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  category text NOT NULL,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON profile_skills(profile_id);

ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are publicly readable"
  ON profile_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON profile_skills FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ─── Profile Tools ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  category text NOT NULL,
  icon_url text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_tools_profile_id ON profile_tools(profile_id);

ALTER TABLE profile_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tools are publicly readable"
  ON profile_tools FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own tools"
  ON profile_tools FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ─── Portfolio Projects ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  tagline text,
  description text,
  cover_image_url text,
  category text,
  tags text[] DEFAULT '{}',
  role text,
  start_date date,
  end_date date,
  external_links jsonb DEFAULT '[]',
  tools_used text[] DEFAULT '{}',
  display_order int DEFAULT 0,
  is_featured boolean DEFAULT false,
  status text DEFAULT 'draft',
  view_count int DEFAULT 0,
  appreciation_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_profile_id ON portfolio_projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_profile_status ON portfolio_projects(profile_id, status);

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published portfolio projects are publicly readable"
  ON portfolio_projects FOR SELECT
  USING (status = 'published' OR profile_id = auth.uid());

CREATE POLICY "Users can manage own portfolio projects"
  ON portfolio_projects FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own portfolio projects"
  ON portfolio_projects FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own portfolio projects"
  ON portfolio_projects FOR DELETE
  USING (profile_id = auth.uid());

-- ─── Portfolio Content Blocks ──────────────────────────────────

CREATE TABLE IF NOT EXISTS portfolio_content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  block_type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_content_blocks_project_id ON portfolio_content_blocks(project_id);

ALTER TABLE portfolio_content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content blocks readable with project access"
  ON portfolio_content_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      WHERE pp.id = portfolio_content_blocks.project_id
        AND (pp.status = 'published' OR pp.profile_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own content blocks"
  ON portfolio_content_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      WHERE pp.id = portfolio_content_blocks.project_id
        AND pp.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      WHERE pp.id = portfolio_content_blocks.project_id
        AND pp.profile_id = auth.uid()
    )
  );

-- ─── Profile Messages ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  from_name text NOT NULL,
  from_email text NOT NULL,
  subject_type text DEFAULT 'general',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_messages_to_profile_id ON profile_messages(to_profile_id);

ALTER TABLE profile_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a message"
  ON profile_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Recipients can read own messages"
  ON profile_messages FOR SELECT
  USING (to_profile_id = auth.uid());

CREATE POLICY "Recipients can update own messages"
  ON profile_messages FOR UPDATE
  USING (to_profile_id = auth.uid())
  WITH CHECK (to_profile_id = auth.uid());
