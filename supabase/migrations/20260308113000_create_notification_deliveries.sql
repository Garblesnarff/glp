create table if not exists public.notification_deliveries (
  id text primary key,
  user_id text not null,
  source_job_id text not null,
  source_reminder_id text not null,
  title text not null,
  body text not null,
  link_to text,
  delivered_at timestamptz not null,
  channel text not null default 'in_app' check (channel in ('in_app')),
  status text not null default 'new' check (status in ('new', 'acknowledged')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notification_deliveries_user_delivered_at_idx
on public.notification_deliveries (user_id, delivered_at desc);

alter table public.notification_deliveries enable row level security;

drop policy if exists "notification_deliveries_manage_own" on public.notification_deliveries;
create policy "notification_deliveries_manage_own"
on public.notification_deliveries
for all
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');
