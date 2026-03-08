alter table public.accounts enable row level security;

drop policy if exists "Members can read their accounts" on public.accounts;
create policy "Members can read their accounts"
on public.accounts
for select
using (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = accounts.id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

drop policy if exists "Authenticated users can create accounts" on public.accounts;
create policy "Authenticated users can create accounts"
on public.accounts
for insert
with check (auth.jwt() ->> 'sub' is not null);

drop policy if exists "Users can insert their own memberships" on public.account_members;
create policy "Users can insert their own memberships"
on public.account_members
for insert
with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Invitees can read their pending partner invites" on public.partner_invites;
create policy "Invitees can read their pending partner invites"
on public.partner_invites
for select
using (
  invited_email = auth.jwt() ->> 'email'
  or exists (
    select 1
    from public.account_members
    where account_members.account_id = partner_invites.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

drop policy if exists "Invitees can accept their pending partner invites" on public.partner_invites;
create policy "Invitees can accept their pending partner invites"
on public.partner_invites
for update
using (
  invited_email = auth.jwt() ->> 'email'
  or exists (
    select 1
    from public.account_members
    where account_members.account_id = partner_invites.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
)
with check (
  invited_email = auth.jwt() ->> 'email'
  or exists (
    select 1
    from public.account_members
    where account_members.account_id = partner_invites.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);
