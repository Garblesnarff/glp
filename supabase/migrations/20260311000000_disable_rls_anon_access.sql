-- Disable RLS on all tables (security handled at application layer via user_id filters)
alter table public.user_profiles disable row level security;
alter table public.accounts disable row level security;
alter table public.account_members disable row level security;
alter table public.partner_invites disable row level security;
alter table public.daily_logs disable row level security;
alter table public.meal_entries disable row level security;
alter table public.meal_planner_state disable row level security;
alter table public.medication_logs disable row level security;
alter table public.notification_jobs disable row level security;
alter table public.notification_deliveries disable row level security;
alter table public.support_alerts disable row level security;
alter table public.weight_logs disable row level security;

-- Grant full access to anon role (anon key used from browser)
grant select, insert, update, delete on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to anon;
grant execute on all functions in schema public to authenticated;

-- Update RPC functions to accept explicit user_id/email instead of reading from auth.jwt()

create or replace function public.ensure_primary_account_for_current_user(
  p_user_id text,
  p_email text default null
)
returns table(account_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_role text;
begin
  -- Check for existing primary membership
  select am.account_id, am.role into v_account_id, v_role
  from account_members am
  join accounts a on a.id = am.account_id
  where am.user_id = p_user_id and a.type = 'primary'
  limit 1;

  if found then
    return query select v_account_id, v_role;
    return;
  end if;

  -- Create primary account
  insert into accounts (type) values ('primary') returning id into v_account_id;
  insert into account_members (account_id, user_id, role)
  values (v_account_id, p_user_id, 'primary_user');

  return query select v_account_id, 'primary_user'::text;
end;
$$;

create or replace function public.accept_partner_invite_for_current_user(
  invite_id uuid,
  p_user_id text,
  p_email text
)
returns table(account_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  -- Validate invite belongs to this email
  select pi.account_id into v_account_id
  from partner_invites pi
  where pi.id = invite_id
    and pi.invited_email = p_email
    and pi.status = 'pending'
  limit 1;

  if not found then
    raise exception 'Invite not found or already processed';
  end if;

  -- Update invite status
  update partner_invites set status = 'accepted' where id = invite_id;

  -- Add as prep_partner member (upsert to handle duplicates)
  insert into account_members (account_id, user_id, role)
  values (v_account_id, p_user_id, 'prep_partner')
  on conflict (user_id) do update set account_id = v_account_id, role = 'prep_partner';

  return query select v_account_id, 'prep_partner'::text;
end;
$$;

create or replace function public.decline_partner_invite_for_current_user(
  invite_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update partner_invites
  set status = 'declined'
  where id = invite_id
    and invited_email = p_email
    and status = 'pending';

  if not found then
    raise exception 'Invite not found or already processed';
  end if;
end;
$$;

create or replace function public.leave_household_for_current_user(
  p_user_id text,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  -- Find the prep_partner membership to remove
  select account_id into v_account_id
  from account_members
  where user_id = p_user_id and role = 'prep_partner'
  limit 1;

  if not found then
    return; -- Already not a member, no-op
  end if;

  -- Remove membership
  delete from account_members where user_id = p_user_id and role = 'prep_partner';

  -- Revoke any pending/accepted invites for this email in this account
  update partner_invites
  set status = 'revoked'
  where account_id = v_account_id
    and invited_email = p_email
    and status in ('pending', 'accepted');
end;
$$;

grant execute on function public.ensure_primary_account_for_current_user(text, text) to anon, authenticated;
grant execute on function public.accept_partner_invite_for_current_user(uuid, text, text) to anon, authenticated;
grant execute on function public.decline_partner_invite_for_current_user(uuid, text) to anon, authenticated;
grant execute on function public.leave_household_for_current_user(text, text) to anon, authenticated;
