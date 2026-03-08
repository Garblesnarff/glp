drop policy if exists "Users can delete their own prep-partner memberships" on public.account_members;
create policy "Users can delete their own prep-partner memberships"
on public.account_members
for delete
using (
  user_id = auth.jwt() ->> 'sub'
  and role = 'prep_partner'
);
