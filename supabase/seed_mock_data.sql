-- ============================================================================
-- MOCK / DEMO DATA for Records of HUMSS-202
-- Simulates the class fund + attendance running since June 1, 2026.
-- Run once in the Supabase SQL Editor. Safe to re-run students/collections are
-- guarded; payments/attendance use random spread so re-running just adds more.
-- To wipe it later, see the CLEANUP block at the very bottom.
-- ============================================================================

-- 1) Class roster (alphabetical, like a class record) -------------------------
insert into public.students (name)
select v.name from (values
  ('Abad, Maria Clara'),
  ('Aquino, Benigno'),
  ('Bautista, Juan Miguel'),
  ('Castro, Andrea Nicole'),
  ('Cruz, Mark Angelo'),
  ('Dela Rosa, Sofia'),
  ('Fernandez, Gabriel'),
  ('Garcia, Patricia Mae'),
  ('Hernandez, Joshua'),
  ('Ignacio, Bea Rose'),
  ('Lim, Nathaniel'),
  ('Mendoza, Angelica'),
  ('Navarro, Christian'),
  ('Ocampo, Danica'),
  ('Ramos, Elijah'),
  ('Santos, Kyla Marie'),
  ('Torres, Rafael'),
  ('Villanueva, Trisha')
) as v(name)
where not exists (select 1 from public.students s where s.name = v.name);

-- 2) Daily ₱2 dues for every school weekday, Jun 1 – Jul 3, 2026 --------------
insert into public.collections (type, label, amount_centavos, date)
select 'daily', to_char(d, 'Mon DD'), 200, d::date
from generate_series('2026-06-01'::date, '2026-07-03'::date, interval '1 day') d
where extract(dow from d) not in (0, 6)  -- skip Sat/Sun
  and not exists (
    select 1 from public.collections c where c.date = d::date and c.type = 'daily'
  );

-- 3) A special collection (shows the "other payments" case) -------------------
insert into public.collections (type, label, amount_centavos, date)
select 'special', 'Field Trip Contribution', 5000, '2026-06-15'
where not exists (
  select 1 from public.collections c
  where c.type = 'special' and c.label = 'Field Trip Contribution'
);

-- 4) Payments — each student pays ~80% of daily dues (varies per student,
--    which makes weeks/months show green / orange / red naturally) ------------
insert into public.payments (student_id, collection_id, amount_centavos)
select s.id, c.id, c.amount_centavos
from public.students s
cross join public.collections c
where c.type = 'daily'
  and random() < 0.80
  and not exists (
    select 1 from public.payments p
    where p.student_id = s.id and p.collection_id = c.id
  );

-- Special collection: ~65% pay in full, ~20% pay half (partial = orange) ------
insert into public.payments (student_id, collection_id, amount_centavos)
select s.id, c.id,
       case when random() < 0.65 then c.amount_centavos else c.amount_centavos / 2 end
from public.students s
cross join public.collections c
where c.type = 'special'
  and random() < 0.85
  and not exists (
    select 1 from public.payments p
    where p.student_id = s.id and p.collection_id = c.id
  );

-- 5) Attendance exceptions (everyone else defaults to Present) ----------------
insert into public.attendance (student_id, date, status, note)
select s.id, x.date::date, x.status, x.note
from (values
  ('Bautista, Juan Miguel', '2026-06-03', 'absent',  null),
  ('Cruz, Mark Angelo',     '2026-06-05', 'excused', 'Medical check-up'),
  ('Garcia, Patricia Mae',  '2026-06-09', 'cutting', null),
  ('Hernandez, Joshua',     '2026-06-12', 'absent',  null),
  ('Mendoza, Angelica',     '2026-06-18', 'excused', 'Family emergency'),
  ('Navarro, Christian',    '2026-06-23', 'cutting', null),
  ('Ramos, Elijah',         '2026-06-25', 'absent',  null),
  ('Torres, Rafael',        '2026-07-01', 'excused', 'Doctor appointment')
) as x(name, date, status, note)
join public.students s on s.name = x.name
on conflict (student_id, date) do nothing;

-- 6) Expenses (money out of the fund) ----------------------------------------
insert into public.expenses (description, amount_centavos, date)
select v.description, v.amount, v.date::date from (values
  ('Bond paper & printing for activities', 15000, '2026-06-10'),
  ('Markers, cartolina & tape',             8000, '2026-06-20'),
  ('Snacks for classroom cleaning day',    12000, '2026-07-01')
) as v(description, amount, date)
where not exists (select 1 from public.expenses e where e.description = v.description);

-- 7) Calendar notes (staff-only projects/deadlines) --------------------------
insert into public.calendar_notes (title, description, due_date)
select v.title, v.descr, v.due::date from (values
  ('Practical Research 2 paper', 'Chapters 1–3, hard copy', '2026-07-10'),
  ('Statistics & Probability problem set', 'Modules 4 and 5', '2026-07-07'),
  ('Group performance task', 'Reflection + video', '2026-07-15')
) as v(title, descr, due)
where not exists (select 1 from public.calendar_notes n where n.title = v.title);

-- ============================================================================
-- CLEANUP (optional) — uncomment and run to remove ALL demo data later:
-- delete from public.payments;
-- delete from public.attendance;
-- delete from public.expenses;
-- delete from public.calendar_notes where title in
--   ('Practical Research 2 paper','Statistics & Probability problem set','Group performance task');
-- delete from public.collections;
-- delete from public.students;
-- ============================================================================
