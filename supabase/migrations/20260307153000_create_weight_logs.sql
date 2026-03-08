create table if not exists public.weight_logs (
  id text primary key,
  user_id text not null,
  date date not null,
  weight numeric not null,
  waist_inches numeric,
  clothes_fit text check (clothes_fit in ('looser', 'same', 'tighter')),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists weight_logs_user_date_idx on public.weight_logs (user_id, date desc);

alter table public.weight_logs enable row level security;

create policy "weight_logs_select_own"
on public.weight_logs
for select
using (auth.jwt() ->> 'sub' = user_id);

create policy "weight_logs_insert_own"
on public.weight_logs
for insert
with check (auth.jwt() ->> 'sub' = user_id);

create policy "weight_logs_update_own"
on public.weight_logs
for update
using (auth.jwt() ->> 'sub' = user_id)
with check (auth.jwt() ->> 'sub' = user_id);

create policy "weight_logs_delete_own"
on public.weight_logs
for delete
using (auth.jwt() ->> 'sub' = user_id);
