-- Admin SELECT-only policies on user-scoped tables
--
-- Problem: the admin dashboard (/admin) queries several tables using the
-- client-side Supabase client (not the service role), which means RLS
-- policies apply. The existing per-user SELECT policies only show a row
-- when auth.uid() matches the owner column, so admins could not see any
-- project/interest/message created by another user. Example symptom:
-- Silent Star Sanctuary was invisible in /admin → Projects even though
-- Mike had submitted it, because the admin logged in as Elliot could not
-- pass the RLS filter.
--
-- Fix: add an additive SELECT policy on each affected table that matches
-- any row when the caller is an admin. No INSERT/UPDATE/DELETE policies
-- are added — admins remain read-only through these policies, so they can
-- track all activity but cannot accidentally delete or modify other users'
-- content through the dashboard. Destructive admin actions continue to
-- route through /api/admin/* endpoints that use supabaseAdmin (service
-- role) and are gated by the admin-password + role check.
--
-- Admin detection pattern matches the existing policy in
-- 20260410000001_claim_flow.sql which uses a subquery against user_profiles.
-- user_profiles already has a "Public profiles are viewable by everyone"
-- SELECT policy (USING (true)), so the subquery can always find the
-- caller's own row without recursion.
--
-- user_profiles itself is skipped here: it is already publicly readable,
-- so admins can already see the full list through the existing policy.

-- ─── project_submissions ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all project_submissions" ON project_submissions;
CREATE POLICY "Admins can view all project_submissions"
  ON project_submissions FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- ─── collaborator_profiles ─────────────────────────────────────────────
-- Used by the older "Join as a Collaborator" form. Without this policy,
-- admins could not see any collaborator applications through the dashboard.
DROP POLICY IF EXISTS "Admins can view all collaborator_profiles" ON collaborator_profiles;
CREATE POLICY "Admins can view all collaborator_profiles"
  ON collaborator_profiles FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- ─── collaboration_interest ────────────────────────────────────────────
-- Populated when someone clicks "I'm interested" on an open collaboration
-- role. Admins need to see all interest entries for triage.
DROP POLICY IF EXISTS "Admins can view all collaboration_interest" ON collaboration_interest;
CREATE POLICY "Admins can view all collaboration_interest"
  ON collaboration_interest FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- ─── profile_messages ──────────────────────────────────────────────────
-- DMs between profiles. The existing SELECT policy only lets the recipient
-- read, which is correct for normal users. Admins need visibility for
-- moderation / abuse review. This policy is SELECT-only, so admins cannot
-- send, edit, or delete messages through the dashboard — only read.
DROP POLICY IF EXISTS "Admins can view all profile_messages" ON profile_messages;
CREATE POLICY "Admins can view all profile_messages"
  ON profile_messages FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );
