alter table public.user_profiles
add column if not exists reminder_preferences jsonb not null default '{
  "enabled": true,
  "deliveryWindow": "morning",
  "quietHoursStart": "21:00",
  "quietHoursEnd": "07:00",
  "shotPrep": true,
  "hydration": true,
  "constipation": true,
  "doseIncrease": true,
  "rotation": true,
  "proteinSupport": true,
  "movement": true
}'::jsonb;
