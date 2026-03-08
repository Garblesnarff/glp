create table if not exists public.support_alerts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_by_user_id text not null,
  kind text not null check (kind in ('rough_day')),
  status text not null default 'active' check (status in ('active', 'resolved')),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

alter table public.support_alerts enable row level security;

drop policy if exists "Account members can read support alerts" on public.support_alerts;
create policy "Account members can read support alerts"
on public.support_alerts
for select
using (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = support_alerts.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

drop policy if exists "Account members can create support alerts" on public.support_alerts;
create policy "Account members can create support alerts"
on public.support_alerts
for insert
with check (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = support_alerts.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);

drop policy if exists "Account members can update support alerts" on public.support_alerts;
create policy "Account members can update support alerts"
on public.support_alerts
for update
using (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = support_alerts.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
)
with check (
  exists (
    select 1
    from public.account_members
    where account_members.account_id = support_alerts.account_id
      and account_members.user_id = auth.jwt() ->> 'sub'
  )
);
