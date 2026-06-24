-- Auto-confirm new sign-ups so staff can log in the instant they register, with no
-- email confirmation step and no need for the admin to be at a computer.
-- This runs entirely in the database, independent of the dashboard's email settings.

create or replace function public.auto_confirm_email() returns trigger
language plpgsql security definer as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_auto_confirm_email on auth.users;
create trigger trg_auto_confirm_email
  before insert on auth.users
  for each row execute function public.auto_confirm_email();

-- Confirm anyone who is already pending from earlier testing.
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
