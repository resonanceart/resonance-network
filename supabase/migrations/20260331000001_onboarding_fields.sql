-- Add onboarding wizard fields to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role_type TEXT,
  ADD COLUMN IF NOT EXISTS collaborator_type TEXT,
  ADD COLUMN IF NOT EXISTS goals TEXT[],
  ADD COLUMN IF NOT EXISTS fields_of_interest TEXT[],
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add a check constraint for valid role_type values
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_type_check
  CHECK (role_type IS NULL OR role_type IN ('artist', 'curator', 'collaborator'));
