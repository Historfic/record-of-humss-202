-- Per-person theme the admin can assign.
--   NULL  = let the user choose (their own toggle)
--   true  = force dark for that user
--   false = force light for that user
-- (The global app_settings.dark_mode still overrides everyone when on.)

alter table public.users add column if not exists dark_mode boolean;
