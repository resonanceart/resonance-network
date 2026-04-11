-- Lightweight version history for user profiles: keep the last 5 snapshots
-- per profile so a user (or admin acting on their behalf) can undo up to
-- five saves back instead of the single-level undo currently provided by
-- the previous_snapshot column (see 20260410000003_profile_undo_snapshot).
--
-- Scope note: this is an intentionally minimal version of the full history
-- plan on ~/Desktop/resonance-network-profile-history-plan.md. No diff view,
-- no pinned versions, no related-table snapshots (skills, tools, work_exp,
-- social_links) — only user_profiles + profile_extended, which already
-- cover the fields that were corrupted during the 2026-04-10 /import
-- incident. The full plan can build on top of this table without a second
-- migration by adding columns.

CREATE TABLE IF NOT EXISTS profile_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Snapshot of the row BEFORE the save that triggered this history entry.
  -- NULL for profile_extended_snapshot when the row didn't exist at save time.
  user_profile_snapshot jsonb NOT NULL,
  profile_extended_snapshot jsonb,

  -- Lightweight metadata — enough to debug which code path created each
  -- entry. Matches a subset of the save_reason enum in the full plan.
  save_reason text CHECK (save_reason IN (
    'manual_save',
    'autosave',
    'import',
    'admin_edit',
    'reimport',
    'claim_finalize'
  )),
  saved_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Primary access path: most recent N rows for a given profile
CREATE INDEX IF NOT EXISTS idx_profile_history_profile_created
  ON profile_history(profile_id, created_at DESC);

-- Trigger: after every insert, prune this profile's history down to the
-- 5 newest rows. The inner subquery selects the 5 most-recent ids for
-- this profile; everything else for that profile gets deleted.
CREATE OR REPLACE FUNCTION prune_profile_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM profile_history
  WHERE profile_id = NEW.profile_id
    AND id NOT IN (
      SELECT id FROM profile_history
      WHERE profile_id = NEW.profile_id
      ORDER BY created_at DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prune_profile_history ON profile_history;
CREATE TRIGGER trg_prune_profile_history
  AFTER INSERT ON profile_history
  FOR EACH ROW
  EXECUTE FUNCTION prune_profile_history();

-- RLS: users see their own history rows; admins see all history rows.
-- Writes only happen through the server with supabaseAdmin (service role
-- bypasses RLS), so no INSERT/UPDATE/DELETE policies for normal users.
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile history" ON profile_history;
CREATE POLICY "Users can view their own profile history"
  ON profile_history FOR SELECT
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profile history" ON profile_history;
CREATE POLICY "Admins can view all profile history"
  ON profile_history FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );
