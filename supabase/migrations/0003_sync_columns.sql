-- Phase 3 (offline/sync prep): add updated_at timestamps so future conflict
-- resolution can use last-write-wins. A trigger keeps them current on every update.

alter table public.students       add column if not exists updated_at timestamptz not null default now();
alter table public.collections    add column if not exists updated_at timestamptz not null default now();
alter table public.payments       add column if not exists updated_at timestamptz not null default now();
alter table public.attendance     add column if not exists updated_at timestamptz not null default now();
alter table public.expenses       add column if not exists updated_at timestamptz not null default now();
alter table public.calendar_notes add column if not exists updated_at timestamptz not null default now();
alter table public.users          add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['students','collections','payments','attendance','expenses','calendar_notes','users']
  loop
    execute format('drop trigger if exists trg_touch_%1$s on public.%1$s;', t);
    execute format(
      'create trigger trg_touch_%1$s before update on public.%1$s
         for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;
