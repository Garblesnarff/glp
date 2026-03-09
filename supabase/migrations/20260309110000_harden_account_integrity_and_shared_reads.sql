create unique index if not exists account_members_user_id_key
on public.account_members (user_id);

alter table public.partner_invites
drop constraint if exists partner_invites_status_check;

alter table public.partner_invites
add constraint partner_invites_status_check
check (status in ('pending', 'accepted', 'declined', 'revoked'));

drop policy if exists "Users can manage their own profile" on public.user_profiles;

create policy "Users can read household profiles"
on public.user_profiles
for select
using (
  user_id = auth.jwt() ->> 'sub'
  or (
    account_id is not null
    and exists (
      select 1
      from public.account_members
      where account_members.account_id = user_profiles.account_id
        and account_members.user_id = auth.jwt() ->> 'sub'
    )
  )
);

create policy "Users can insert their own profile"
on public.user_profiles
for insert
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can update their own profile"
on public.user_profiles
for update
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can delete their own profile"
on public.user_profiles
for delete
using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can manage their own medication logs" on public.medication_logs;

create policy "Users can read household medication logs"
on public.medication_logs
for select
using (
  user_id = auth.jwt() ->> 'sub'
  or exists (
    select 1
    from public.user_profiles
    join public.account_members
      on account_members.account_id = user_profiles.account_id
    where user_profiles.user_id = medication_logs.user_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

create policy "Users can insert their own medication logs"
on public.medication_logs
for insert
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can update their own medication logs"
on public.medication_logs
for update
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can delete their own medication logs"
on public.medication_logs
for delete
using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can manage their own daily logs" on public.daily_logs;

create policy "Users can read household daily logs"
on public.daily_logs
for select
using (
  user_id = auth.jwt() ->> 'sub'
  or exists (
    select 1
    from public.user_profiles
    join public.account_members
      on account_members.account_id = user_profiles.account_id
    where user_profiles.user_id = daily_logs.user_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

create policy "Users can insert their own daily logs"
on public.daily_logs
for insert
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can update their own daily logs"
on public.daily_logs
for update
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can delete their own daily logs"
on public.daily_logs
for delete
using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can manage their own meal entries" on public.meal_entries;

create policy "Users can read household meal entries"
on public.meal_entries
for select
using (
  user_id = auth.jwt() ->> 'sub'
  or exists (
    select 1
    from public.user_profiles
    join public.account_members
      on account_members.account_id = user_profiles.account_id
    where user_profiles.user_id = meal_entries.user_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

create policy "Users can insert their own meal entries"
on public.meal_entries
for insert
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can update their own meal entries"
on public.meal_entries
for update
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

create policy "Users can delete their own meal entries"
on public.meal_entries
for delete
using (user_id = auth.jwt() ->> 'sub');

create or replace function public.ensure_primary_account_for_current_user()
returns table (account_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id text := auth.jwt() ->> 'sub';
  existing_account_id uuid;
  existing_role text;
  created_account_id uuid;
begin
  if current_user_id is null then
    raise exception 'auth user required';
  end if;

  select account_members.account_id, account_members.role
  into existing_account_id, existing_role
  from public.account_members
  where account_members.user_id = current_user_id
  limit 1;

  if existing_account_id is not null then
    return query select existing_account_id, existing_role;
    return;
  end if;

  insert into public.accounts default values
  returning id into created_account_id;

  insert into public.account_members (account_id, user_id, role)
  values (created_account_id, current_user_id, 'primary')
  on conflict (user_id) do nothing;

  select account_members.account_id, account_members.role
  into existing_account_id, existing_role
  from public.account_members
  where account_members.user_id = current_user_id
  limit 1;

  if existing_account_id is null then
    raise exception 'account membership could not be created';
  end if;

  insert into public.user_profiles (user_id, account_id, role)
  values (current_user_id, existing_account_id, 'primary')
  on conflict (user_id) do update
    set account_id = excluded.account_id,
        role = 'primary';

  if created_account_id is distinct from existing_account_id then
    delete from public.accounts
    where id = created_account_id
      and not exists (
        select 1
        from public.account_members
        where account_members.account_id = created_account_id
      );
  end if;

  return query select existing_account_id, existing_role;
end;
$$;

create or replace function public.accept_partner_invite_for_current_user(invite_id uuid)
returns table (account_id uuid, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id text := auth.jwt() ->> 'sub';
  current_email text := auth.jwt() ->> 'email';
  invite_account_id uuid;
begin
  if current_user_id is null or current_email is null then
    raise exception 'auth user and email required';
  end if;

  select partner_invites.account_id
  into invite_account_id
  from public.partner_invites
  where partner_invites.id = invite_id
    and partner_invites.invited_email = current_email
    and partner_invites.status = 'pending'
  for update;

  if invite_account_id is null then
    return query
    select account_members.account_id, account_members.role
    from public.account_members
    where account_members.user_id = current_user_id
    limit 1;
    return;
  end if;

  insert into public.account_members (account_id, user_id, role)
  values (invite_account_id, current_user_id, 'prep_partner')
  on conflict (user_id) do update
    set account_id = excluded.account_id,
        role = 'prep_partner';

  insert into public.user_profiles (user_id, account_id, role)
  values (current_user_id, invite_account_id, 'prep_partner')
  on conflict (user_id) do update
    set account_id = excluded.account_id,
        role = 'prep_partner';

  update public.partner_invites
  set status = 'accepted'
  where id = invite_id;

  return query select invite_account_id, 'prep_partner'::text;
end;
$$;

create or replace function public.decline_partner_invite_for_current_user(invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text := auth.jwt() ->> 'email';
begin
  if current_email is null then
    raise exception 'auth email required';
  end if;

  update public.partner_invites
  set status = 'declined'
  where id = invite_id
    and invited_email = current_email
    and status = 'pending';
end;
$$;

create or replace function public.leave_household_for_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id text := auth.jwt() ->> 'sub';
  current_email text := auth.jwt() ->> 'email';
  linked_account_id uuid;
begin
  if current_user_id is null then
    raise exception 'auth user required';
  end if;

  select account_members.account_id
  into linked_account_id
  from public.account_members
  where account_members.user_id = current_user_id
    and account_members.role = 'prep_partner'
  limit 1;

  if linked_account_id is null then
    return;
  end if;

  delete from public.account_members
  where account_members.user_id = current_user_id
    and account_members.role = 'prep_partner';

  update public.user_profiles
  set account_id = null
  where user_profiles.user_id = current_user_id;

  if current_email is not null then
    update public.partner_invites
    set status = 'revoked'
    where partner_invites.account_id = linked_account_id
      and partner_invites.invited_email = current_email
      and partner_invites.status = 'accepted';
  end if;
end;
$$;

grant execute on function public.ensure_primary_account_for_current_user() to authenticated;
grant execute on function public.accept_partner_invite_for_current_user(uuid) to authenticated;
grant execute on function public.decline_partner_invite_for_current_user(uuid) to authenticated;
grant execute on function public.leave_household_for_current_user() to authenticated;
