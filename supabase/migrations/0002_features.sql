-- Phase 2: funds, attendance, expenses, calendar
-- amounts are stored in centavos (integer) to avoid floating-point money errors.

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('daily','weekly','special')),
  label text not null,
  amount_centavos int not null check (amount_centavos >= 0),
  date date not null,
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  amount_centavos int not null check (amount_centavos >= 0),
  paid_at timestamptz not null default now(),
  recorded_by uuid references public.users(id),
  deleted boolean not null default false
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present','absent','excused','cutting')),
  note text,
  recorded_by uuid references public.users(id),
  unique (student_id, date)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount_centavos int not null check (amount_centavos >= 0),
  date date not null,
  recorded_by uuid references public.users(id),
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.calendar_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date,
  created_by uuid references public.users(id),
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.collections enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;
alter table public.expenses enable row level security;
alter table public.calendar_notes enable row level security;

-- Transparency data is public to view (guests + anon); only active staff write.
create policy collections_select_all on public.collections
  for select using (deleted = false);
create policy collections_write_staff on public.collections
  for all using (public.is_staff()) with check (public.is_staff());

create policy payments_select_all on public.payments
  for select using (deleted = false);
create policy payments_write_staff on public.payments
  for all using (public.is_staff()) with check (public.is_staff());

create policy expenses_select_all on public.expenses
  for select using (deleted = false);
-- staff may record/remove expenses; only admin may edit/delete after the fact.
create policy expenses_insert_staff on public.expenses
  for insert with check (public.is_staff());
create policy expenses_update_admin on public.expenses
  for update using (public.is_admin()) with check (public.is_admin());
create policy expenses_delete_admin on public.expenses
  for delete using (public.is_admin());

-- Attendance + calendar are staff-only (not part of the public transparency view).
create policy attendance_all_staff on public.attendance
  for all using (public.is_staff()) with check (public.is_staff());

create policy calendar_all_staff on public.calendar_notes
  for all using (public.is_staff()) with check (public.is_staff());
