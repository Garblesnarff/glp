create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.account_members (
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('primary', 'prep_partner')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (account_id, user_id)
);

create table if not exists public.user_profiles (
  user_id text primary key,
  account_id uuid references public.accounts(id) on delete cascade,
  name text not null default '',
  role text not null default 'primary' check (role in ('primary', 'prep_partner')),
  current_weight numeric not null default 0,
  goal_weight numeric,
  protein_target_min integer not null default 114,
  protein_target_max integer not null default 143,
  fiber_target integer not null default 25,
  hydration_goal integer not null default 64,
  dietary_restrictions text[] not null default '{}',
  medication_name text not null default '',
  medication_start_date date not null default current_date,
  shot_day text not null default 'Monday',
  prep_partner_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  medication text not null,
  dose text not null,
  shot_day text not null,
  injection_site text not null,
  date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_logs (
  user_id text not null,
  date date not null,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, date)
);

create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id text not null,
  portion text not null check (portion in ('mini', 'half', 'full')),
  actual_protein integer not null default 0,
  actual_fiber integer not null default 0,
  actual_calories integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.partner_invites (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  invited_email text not null,
  role text not null default 'prep_partner' check (role in ('prep_partner')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.account_members enable row level security;
alter table public.user_profiles enable row level security;
alter table public.medication_logs enable row level security;
alter table public.daily_logs enable row level security;
alter table public.meal_entries enable row level security;
alter table public.partner_invites enable row level security;

drop policy if exists "Members can read their account memberships" on public.account_members;
create policy "Members can read their account memberships"
on public.account_members
for select
using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can manage their own profile" on public.user_profiles;
create policy "Users can manage their own profile"
on public.user_profiles
for all
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can manage their own medication logs" on public.medication_logs;
create policy "Users can manage their own medication logs"
on public.medication_logs
for all
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can manage their own daily logs" on public.daily_logs;
create policy "Users can manage their own daily logs"
on public.daily_logs
for all
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Users can manage their own meal entries" on public.meal_entries;
create policy "Users can manage their own meal entries"
on public.meal_entries
for all
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');

drop policy if exists "Account members can read partner invites" on public.partner_invites;
create policy "Account members can read partner invites"
on public.partner_invites
for select
using (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = partner_invites.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);
