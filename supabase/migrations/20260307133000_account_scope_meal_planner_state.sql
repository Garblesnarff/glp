alter table public.meal_planner_state
add column if not exists account_id uuid references public.accounts(id) on delete cascade;

update public.meal_planner_state
set account_id = account_members.account_id
from public.account_members
where account_members.user_id = meal_planner_state.user_id
  and meal_planner_state.account_id is null;

create unique index if not exists meal_planner_state_account_id_key on public.meal_planner_state(account_id);

drop policy if exists "Users can read their own meal planner state" on public.meal_planner_state;
create policy "Account members can read household meal planner state"
on public.meal_planner_state
for select
using (
  (
    account_id is not null
    and exists (
      select 1
      from public.account_members
      where account_members.account_id = meal_planner_state.account_id
        and account_members.user_id = auth.jwt() ->> 'sub'
    )
  )
  or user_id = auth.jwt() ->> 'sub'
);

drop policy if exists "Users can insert their own meal planner state" on public.meal_planner_state;
create policy "Account members can insert household meal planner state"
on public.meal_planner_state
for insert
with check (
  (
    account_id is not null
    and exists (
      select 1
      from public.account_members
      where account_members.account_id = meal_planner_state.account_id
        and account_members.user_id = auth.jwt() ->> 'sub'
    )
  )
  or user_id = auth.jwt() ->> 'sub'
);

drop policy if exists "Users can update their own meal planner state" on public.meal_planner_state;
create policy "Account members can update household meal planner state"
on public.meal_planner_state
for update
using (
  (
    account_id is not null
    and exists (
      select 1
      from public.account_members
      where account_members.account_id = meal_planner_state.account_id
        and account_members.user_id = auth.jwt() ->> 'sub'
    )
  )
  or user_id = auth.jwt() ->> 'sub'
)
with check (
  (
    account_id is not null
    and exists (
      select 1
      from public.account_members
      where account_members.account_id = meal_planner_state.account_id
        and account_members.user_id = auth.jwt() ->> 'sub'
    )
  )
  or user_id = auth.jwt() ->> 'sub'
);
