-- User profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  display_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  bio text,
  location text,
  website text,
  skills text[],
  role text DEFAULT 'collaborator' CHECK (role IN ('collaborator', 'creator', 'admin')),
  -- Link to existing tables
  collaborator_profile_id uuid REFERENCES collaborator_profiles(id),
  onboarding_complete boolean DEFAULT false
);

-- Follows table (users follow projects)
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text NOT NULL, -- Can be JSON project ID or Supabase UUID
  UNIQUE(user_id, project_id)
);

-- Messages table (notifications/messages to users)
CREATE TABLE IF NOT EXISTS user_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name text,
  subject text NOT NULL,
  body text NOT NULL,
  read boolean DEFAULT false,
  message_type text DEFAULT 'notification' CHECK (message_type IN ('notification', 'collaboration_interest', 'project_update', 'system')),
  related_project text,
  related_task text
);

-- RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- user_profiles: users can read all profiles, edit only their own
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role bypass for all tables
CREATE POLICY "Service role full access on user_profiles" ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- user_follows: users can manage their own follows
CREATE POLICY "Users can view own follows" ON user_follows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follows" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own follows" ON user_follows
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_follows" ON user_follows
  FOR ALL USING (true) WITH CHECK (true);

-- user_messages: users can read their own messages
CREATE POLICY "Users can view own messages" ON user_messages
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own messages" ON user_messages
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Service role full access on user_messages" ON user_messages
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user_profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
