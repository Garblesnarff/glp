alter table public.user_profiles
add column if not exists medication_supply_days integer not null default 28,
add column if not exists refill_lead_days integer not null default 5,
add column if not exists last_refill_date date;
