create table if not exists public.meal_planner_state (
  user_id text primary key,
  week_plan jsonb,
  grocery_state jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists meal_planner_state_set_updated_at on public.meal_planner_state;
create trigger meal_planner_state_set_updated_at
before update on public.meal_planner_state
for each row
execute function public.set_updated_at();

alter table public.meal_planner_state enable row level security;

drop policy if exists "Users can read their own meal planner state" on public.meal_planner_state;
create policy "Users can read their own meal planner state"
on public.meal_planner_state
for select
using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can insert their own meal planner state" on public.meal_planner_state;
create policy "Users can insert their own meal planner state"
on public.meal_planner_state
for insert
with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can update their own meal planner state" on public.meal_planner_state;
create policy "Users can update their own meal planner state"
on public.meal_planner_state
for update
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');
