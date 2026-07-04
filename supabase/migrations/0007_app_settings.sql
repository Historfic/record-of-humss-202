-- A single-row settings table for app-wide preferences the admin controls.
-- dark_mode = true forces dark theme for everyone; false lets each user choose.

create table if not exists public.app_settings (
  id int primary key default 1,
  dark_mode boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint app_settings_single_row check (id = 1)
);

insert into public.app_settings (id, dark_mode)
values (1, false)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- Anyone (incl. guests) may read the setting so the theme applies for everyone.
drop policy if exists app_settings_read_all on public.app_settings;
create policy app_settings_read_all on public.app_settings
  for select using (true);

-- Only an admin may change it.
drop policy if exists app_settings_write_admin on public.app_settings;
create policy app_settings_write_admin on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());
