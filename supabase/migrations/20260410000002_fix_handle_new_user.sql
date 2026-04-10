-- Fix: auth signup is failing project-wide with "Database error creating new user"
-- because handle_new_user raises an exception that bubbles up through GoTrue.
--
-- Root cause: the original trigger did a bare INSERT with no ON CONFLICT and
-- no exception handler. If ANY downstream trigger (e.g. trg_generate_profile_slug
-- on user_profiles) or FK/constraint fails, the auth.users insert is aborted.
--
-- Fix: recreate handle_new_user so it
--   1. Uses INSERT ... ON CONFLICT DO NOTHING (idempotent — callers can upsert
--      safely later)
--   2. Wraps in BEGIN/EXCEPTION/END so any error is logged but never propagates
--      to GoTrue. The worst case is that the auth user lands without a profile
--      row — application code creates or upserts the profile explicitly anyway.
--   3. Sets search_path explicitly to stop search_path hijack warnings on
--      SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (id, email, display_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(COALESCE(NEW.email, ''), '@', 1)
      )
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: profile insert failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Re-grant execute to the auth roles that invoke the trigger.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
