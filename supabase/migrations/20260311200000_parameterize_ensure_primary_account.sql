-- Replace JWT-based function with explicit p_user_id param.
-- The app uses WorkOS auth (anon key only), so auth.jwt() is always null.
-- All other RPC functions already use this explicit-param pattern.
DROP FUNCTION IF EXISTS public.ensure_primary_account_for_current_user();

CREATE OR REPLACE FUNCTION public.ensure_primary_account_for_current_user(
  p_user_id text
)
RETURNS TABLE(account_id uuid, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_account_id uuid;
  existing_role text;
  created_account_id uuid;
BEGIN
  -- Check for existing membership
  SELECT am.account_id, am.role
  INTO existing_account_id, existing_role
  FROM public.account_members am
  WHERE am.user_id = p_user_id
  LIMIT 1;

  IF existing_account_id IS NOT NULL THEN
    RETURN QUERY SELECT existing_account_id, existing_role;
    RETURN;
  END IF;

  -- Create new primary account
  INSERT INTO public.accounts DEFAULT VALUES
  RETURNING id INTO created_account_id;

  INSERT INTO public.account_members (account_id, user_id, role)
  VALUES (created_account_id, p_user_id, 'primary')
  ON CONFLICT (user_id) DO NOTHING;

  -- Re-fetch in case of conflict
  SELECT am.account_id, am.role
  INTO existing_account_id, existing_role
  FROM public.account_members am
  WHERE am.user_id = p_user_id
  LIMIT 1;

  IF existing_account_id IS NULL THEN
    RAISE EXCEPTION 'account membership could not be created';
  END IF;

  -- Upsert user_profiles with account_id
  INSERT INTO public.user_profiles (user_id, account_id, role)
  VALUES (p_user_id, existing_account_id, 'primary')
  ON CONFLICT (user_id) DO UPDATE
    SET account_id = EXCLUDED.account_id,
        role = 'primary';

  -- Clean up orphaned account if conflict occurred
  IF created_account_id IS DISTINCT FROM existing_account_id THEN
    DELETE FROM public.accounts
    WHERE id = created_account_id
      AND NOT EXISTS (
        SELECT 1 FROM public.account_members
        WHERE account_members.account_id = created_account_id
      );
  END IF;

  RETURN QUERY SELECT existing_account_id, existing_role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_primary_account_for_current_user(text) TO anon, authenticated;
