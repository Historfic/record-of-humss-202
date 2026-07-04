-- New sign-ups arrive as 'pending' (no editing powers) until an admin approves
-- them in the Admin -> Staff tab. is_staff()/is_admin() still require status
-- 'active', so pending users can view but not write.

alter table public.users drop constraint if exists users_status_check;
alter table public.users add constraint users_status_check
  check (status in ('active', 'revoked', 'pending'));

-- A self sign-up may only create its own row as a pending auditor.
drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users
  for insert with check (id = auth.uid() and role = 'auditor' and status = 'pending');
