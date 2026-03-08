alter table public.notification_jobs
add column if not exists requested_channel text not null default 'in_app' check (requested_channel in ('in_app', 'email', 'sms'));

alter table public.notification_jobs
add column if not exists fallback_reason text;

alter table public.notification_deliveries
add column if not exists requested_channel text not null default 'in_app' check (requested_channel in ('in_app', 'email', 'sms'));

alter table public.notification_deliveries
add column if not exists fallback_reason text;
