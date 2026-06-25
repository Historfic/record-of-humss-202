-- Receipt photos for expenses.

alter table public.expenses add column if not exists receipt_url text;

-- A public storage bucket to hold receipt images (URLs are public; uploads are staff-only).
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

drop policy if exists "receipts public read" on storage.objects;
create policy "receipts public read" on storage.objects
  for select using (bucket_id = 'receipts');

drop policy if exists "receipts staff upload" on storage.objects;
create policy "receipts staff upload" on storage.objects
  for insert with check (bucket_id = 'receipts' and public.is_staff());
