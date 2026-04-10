-- Claim Flow: admin-built claimable profiles + claim tokens
-- Admins can prebuild a user_profile (with a placeholder auth user) and later
-- send a unique claim link. When the recipient claims, we update the existing
-- auth user's email/password in place so no data needs to be re-linked.

-- 1. Extend user_profiles with claimable flags
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_claimable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS target_email text,
  ADD COLUMN IF NOT EXISTS original_source_url text,
  ADD COLUMN IF NOT EXISTS created_by_admin boolean DEFAULT false;

-- Fast lookup of the pending claimable profile for a given target email
CREATE INDEX IF NOT EXISTS idx_user_profiles_target_email
  ON user_profiles(target_email)
  WHERE is_claimable = true;

-- 2. claim_tokens table
CREATE TABLE IF NOT EXISTS claim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  target_email text NOT NULL,
  prebuilt_profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  claimed_at timestamptz,
  claimed_by_user_id uuid REFERENCES auth.users(id),
  last_sent_at timestamptz DEFAULT now(),
  send_count int DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_claim_tokens_token ON claim_tokens(token);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_pending
  ON claim_tokens(target_email)
  WHERE claimed_at IS NULL;

-- 3. RLS: service role only. The /api/claim/preview endpoint is the sole
-- public gatekeeper and uses supabaseAdmin (which bypasses RLS). Admins
-- create tokens through /api/admin/send-claim-invite which also uses the
-- service-role client, but we add an explicit INSERT policy for defense in
-- depth should anyone ever use an authenticated user client to insert.
ALTER TABLE claim_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_insert_claim_tokens" ON claim_tokens
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Deliberately: no SELECT / UPDATE / DELETE policies for non-service-role.
-- profile_visibility is TEXT with a CHECK constraint that already allows
-- 'draft' (see 20250101000004_unified_accounts.sql), so no enum change is
-- needed.
