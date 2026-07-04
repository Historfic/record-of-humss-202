-- Owner-only activity log: records who changed what and when.
-- A SECURITY DEFINER trigger captures auth.uid() on every write, so entries
-- reflect the real signed-in user and cannot be forged from the UI.

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  action text not null,          -- INSERT | UPDATE | DELETE
  row_id text,
  actor uuid,
  actor_email text,
  at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Only an admin may read the log.
drop policy if exists audit_read_admin on public.audit_log;
create policy audit_read_admin on public.audit_log
  for select using (public.is_admin());

create or replace function public.log_change() returns trigger
language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  email text;
  rid text;
begin
  select u.email into email from public.users u where u.id = uid;
  rid := (case when tg_op = 'DELETE' then old.id else new.id end)::text;
  insert into public.audit_log (table_name, action, row_id, actor, actor_email)
  values (tg_table_name, tg_op, rid, uid, email);
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['payments','expenses','attendance','collections','students','calendar_notes']
  loop
    execute format('drop trigger if exists trg_audit_%1$s on public.%1$s;', t);
    execute format(
      'create trigger trg_audit_%1$s after insert or update or delete on public.%1$s
         for each row execute function public.log_change();', t);
  end loop;
end $$;
