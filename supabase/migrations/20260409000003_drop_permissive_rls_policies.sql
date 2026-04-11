-- SEC-8/SEC-1: Drop overly permissive "FOR ALL USING (true)" RLS policies
-- These policies grant any authenticated user full read/write access to all rows,
-- defeating all other RLS policies on these tables.

DROP POLICY IF EXISTS "Allow service role full access on project_submissions" ON project_submissions;
DROP POLICY IF EXISTS "Allow service role full access on collaboration_interest" ON collaboration_interest;
DROP POLICY IF EXISTS "Allow service role full access on collaborator_profiles" ON collaborator_profiles;
DROP POLICY IF EXISTS "Service role full access on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access on user_follows" ON user_follows;
DROP POLICY IF EXISTS "Service role full access on user_messages" ON user_messages;
