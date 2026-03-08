create table if not exists public.notification_jobs (
  id text primary key,
  user_id text not null,
  source_reminder_id text not null,
  title text not null,
  body text not null,
  link_to text,
  send_at timestamptz not null,
  channel text not null default 'in_app' check (channel in ('in_app')),
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notification_jobs_user_send_at_idx on public.notification_jobs (user_id, send_at);

alter table public.notification_jobs enable row level security;

drop policy if exists "notification_jobs_manage_own" on public.notification_jobs;
create policy "notification_jobs_manage_own"
on public.notification_jobs
for all
using (user_id = auth.jwt() ->> 'sub')
with check (user_id = auth.jwt() ->> 'sub');
