drop policy if exists "Account members can create partner invites" on public.partner_invites;
create policy "Account members can create partner invites"
on public.partner_invites
for insert
with check (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = partner_invites.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

drop policy if exists "Account members can update partner invites" on public.partner_invites;
create policy "Account members can update partner invites"
on public.partner_invites
for update
using (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = partner_invites.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
)
with check (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = partner_invites.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);
