-- Performance indexes based on common query patterns

-- user_profiles: filtered by visibility on every public listing
CREATE INDEX IF NOT EXISTS idx_user_profiles_visibility ON user_profiles(profile_visibility);

-- user_profiles: email lookups for linking submissions
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- user_follows: dashboard loads all follows for a user
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);

-- portfolio_projects: public pages look up by slug
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_slug ON portfolio_projects(slug);

-- project_submissions: admin filters by status
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON project_submissions(status);

-- profile_messages: filtered by read status
CREATE INDEX IF NOT EXISTS idx_profile_messages_read ON profile_messages(to_profile_id, is_read);

-- user_messages: filtered by read status
CREATE INDEX IF NOT EXISTS idx_user_messages_read ON user_messages(recipient_id, read);
