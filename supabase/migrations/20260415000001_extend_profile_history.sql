-- Extend profile history retention from 5 to 50 snapshots per profile.
-- Lets users restore from further back than a single recent save and
-- supports a forthcoming "History" browser UI that lists past versions
-- with timestamps.

CREATE OR REPLACE FUNCTION prune_profile_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM profile_history
  WHERE profile_id = NEW.profile_id
    AND id NOT IN (
      SELECT id FROM profile_history
      WHERE profile_id = NEW.profile_id
      ORDER BY created_at DESC
      LIMIT 50
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
