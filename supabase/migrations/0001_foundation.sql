-- users: one row per staff account, linked to auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'auditor' check (role in ('admin','treasurer','auditor')),
  title text,
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  deleted boolean not null default false
);

create table public.guest_log (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visited_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.guest_log enable row level security;

-- helper: is the current auth user an admin?
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists(select 1 from public.users u where u.id = auth.uid() and u.role = 'admin' and u.status = 'active');
$$;

-- helper: is the current auth user active staff?
create or replace function public.is_staff() returns boolean
language sql security definer stable as $$
  select exists(select 1 from public.users u where u.id = auth.uid() and u.status = 'active');
$$;

-- users policies
create policy users_select_self_or_admin on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy users_insert_self on public.users
  for insert with check (id = auth.uid());
create policy users_update_admin on public.users
  for update using (public.is_admin());

-- students: anyone (incl. anon) may read non-deleted; only staff write
create policy students_select_all on public.students
  for select using (deleted = false);
create policy students_write_staff on public.students
  for all using (public.is_staff()) with check (public.is_staff());

-- guest_log: anyone may insert their visit; only admin reads
create policy guest_log_insert_any on public.guest_log
  for insert with check (true);
create policy guest_log_select_admin on public.guest_log
  for select using (public.is_admin());
