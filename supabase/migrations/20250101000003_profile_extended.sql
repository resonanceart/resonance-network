-- Profile Extended: rich profile data (media gallery, timeline, etc.)
CREATE TABLE IF NOT EXISTS profile_extended (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  media_gallery jsonb DEFAULT '[]'::jsonb,
  projects jsonb DEFAULT '[]'::jsonb,
  links jsonb DEFAULT '[]'::jsonb,
  timeline jsonb DEFAULT '[]'::jsonb,
  testimonials jsonb DEFAULT '[]'::jsonb,
  achievements text[] DEFAULT '{}',
  philosophy text,
  cover_image_url text,
  tools_and_materials text[] DEFAULT '{}',
  availability_status text DEFAULT 'open' CHECK (availability_status IN ('open', 'busy', 'unavailable')),
  availability_note text
);

ALTER TABLE profile_extended ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON profile_extended FOR SELECT USING (true);
CREATE POLICY "Users can update own" ON profile_extended FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own" ON profile_extended FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profile_extended_updated_at
  BEFORE UPDATE ON profile_extended
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
