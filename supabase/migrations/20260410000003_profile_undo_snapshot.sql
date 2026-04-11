-- Adds a single-level "undo last save" snapshot on user_profiles and
-- profile_extended. This is NOT a full version history — only the most
-- recent pre-save state is retained so a user (or admin acting on their
-- behalf) can revert one step after an accidental overwrite (e.g. the
-- /import?profile flow that trampled the admin's bio and media).

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS previous_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS previous_snapshot_at TIMESTAMPTZ;

ALTER TABLE profile_extended
  ADD COLUMN IF NOT EXISTS previous_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS previous_snapshot_at TIMESTAMPTZ;
