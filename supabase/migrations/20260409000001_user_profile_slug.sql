-- Add slug column to user_profiles for efficient profile lookups
-- Previously, profile pages fetched ALL rows and filtered in JS

-- Add the column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_slug ON user_profiles (slug) WHERE slug IS NOT NULL;

-- Slugify function
CREATE OR REPLACE FUNCTION generate_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
    RETURN NEW;
  END IF;

  -- Generate base slug: lowercase, replace non-alphanumeric with hyphens, trim hyphens
  base_slug := regexp_replace(
    regexp_replace(lower(NEW.display_name), '[^a-z0-9]+', '-', 'g'),
    '(^-|-$)', '', 'g'
  );

  -- If slug unchanged (display_name didn't change), skip
  IF NEW.slug = base_slug THEN
    RETURN NEW;
  END IF;

  -- Check for uniqueness, append suffix if needed
  final_slug := base_slug;
  LOOP
    -- Check if slug is taken by another row
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE slug = final_slug AND id != NEW.id
    ) THEN
      NEW.slug := final_slug;
      RETURN NEW;
    END IF;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger on insert and update of display_name
DROP TRIGGER IF EXISTS trg_generate_profile_slug ON user_profiles;
CREATE TRIGGER trg_generate_profile_slug
  BEFORE INSERT OR UPDATE OF display_name ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_profile_slug();

-- Backfill existing rows
DO $$
DECLARE
  r RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR r IN SELECT id, display_name FROM user_profiles WHERE slug IS NULL AND display_name IS NOT NULL ORDER BY created_at ASC
  LOOP
    base_slug := regexp_replace(
      regexp_replace(lower(r.display_name), '[^a-z0-9]+', '-', 'g'),
      '(^-|-$)', '', 'g'
    );
    final_slug := base_slug;
    counter := 0;
    LOOP
      IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE slug = final_slug AND id != r.id) THEN
        UPDATE user_profiles SET slug = final_slug WHERE id = r.id;
        EXIT;
      END IF;
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
  END LOOP;
END;
$$;
