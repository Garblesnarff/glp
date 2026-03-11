-- Drop the old parameterized overload that conflicts with the no-param version
-- from 20260309110000_harden_account_integrity_and_shared_reads.sql.
-- PostgREST returns 400 when two overloads exist for the same function name.
DROP FUNCTION IF EXISTS public.ensure_primary_account_for_current_user(p_user_id text, p_email text);
