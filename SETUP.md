# Transparency Report — Setup & Operations Guide

Everything you need to do **manually** (the things I can't do for you). Work top to bottom.

---

## A. One-time database setup (Supabase)

1. **Project** — at https://supabase.com create a project (save the DB password somewhere).
2. **Run the 3 migrations** — Supabase → **SQL Editor** → New query. For EACH file below,
   open it, copy all, paste, **Run** (expect "Success"):
   - `supabase/migrations/0001_foundation.sql`
   - `supabase/migrations/0002_features.sql`
   - `supabase/migrations/0003_sync_columns.sql`
   Verify in **Table Editor**: you should see `users, students, collections, payments,
   attendance, expenses, calendar_notes, guest_log`.
3. **Turn OFF email confirmation** — Authentication → **Providers** → **Email** →
   toggle **Confirm email** OFF → Save. (Stops the "email rate limit" / "not confirmed" errors.)

## B. Make yourself the admin

1. Run the app (Section D) and **Sign up** with your email + a throwaway password, OR
   create the user in Authentication → Users → Add user (check **Auto Confirm**).
2. In **SQL Editor**, run (use your real email):
   ```sql
   insert into public.users (id, email, role, title, status)
   select id, email, 'admin', 'Owner', 'active'
   from auth.users where email = 'rafael@mcgendigital.com'
   on conflict (id) do update set role = 'admin', title = 'Owner', status = 'active';
   ```
3. Reload the app — you now have the **Staff** tab.

## C. Connect the app to Supabase (keys)

Create a file `.env.local` in the project root (already git-ignored) with your real values
from Supabase → **Project Settings → API**:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
⚠️ The URL is `https://<ref>.supabase.co` — NOT the dashboard link.

## D. Run locally (on your computer)

```
npm install      # first time only
npm run dev      # opens http://localhost:5173
```
- Go to the **Entry** tab → add students, create a collection (due), record a payment.
- Check the **Transparency** tab → colored grid + Day/Week/Month toggle.
- **Attendance** tab → tap a student → mark Absent/Excused/Cutting.
- **Ledger** → money in/out + balance; add an expense.
- **Calendar** → add a project/homework with a deadline.
- 🧮 floating button → calculator.

## E. Put it online so classmates can use it (deploy)

`localhost` only works on YOUR computer. To share a link with the class, deploy the PWA
(free). Easiest = **Vercel**:

1. Push this repo to GitHub (see Section H).
2. Go to https://vercel.com → **Add New → Project** → import your GitHub repo.
3. Framework preset: **Vite**. Build command `npm run build`, output dir `dist` (auto-detected).
4. **Environment Variables** — add the SAME two keys as your `.env.local`:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. **Deploy.** You get a URL like `https://transparency-report.vercel.app`.
6. Share that link. On a phone: open it → browser menu → **Add to Home Screen** → it
   installs like an app (icon, fullscreen, offline).

(Netlify works the same way if you prefer it.)

## F. How offline works (what to expect)

- **Viewing offline:** once the app has loaded online at least once, the report still opens
  with no internet (shows the last-synced data).
- **Editing offline:** marking attendance / recording payments offline is **saved on the
  phone** and a yellow bar shows "Offline — N change(s) will sync." When internet returns,
  it **auto-syncs** and the bar turns blue ("Syncing…") then disappears.
- Tip: each staff member should open the app online once on their phone before relying on
  offline use, so the app and data are cached.

## G. Giving access to treasurer / auditor

1. They open your deployed link and **Sign up** (email + password).
2. Their account appears in your **Staff** tab → set their **role** (treasurer/auditor) and
   **title** → Save. Guests just type a name to view the report (no account).

## H. Push to GitHub (needed for deploy + backup)

```
# create an empty repo on github.com first, then:
git remote add origin https://github.com/YOUR-USERNAME/transparency-report.git
git push -u origin master
```

---

## What's done ✅
Foundation (auth/roles/admin), Attendance, Transparency grid (day/week/month + colors),
Ledger (money in/out + balance + expenses), Staff data-entry, Calendar notes, Calculator,
and offline support (read caching + write outbox with auto-sync). All on `master`, 62 tests passing.

## Known follow-ups (not blocking) 🔧
- **Admin "reset a member's password" button** — needs a small secure server function
  (Supabase Edge Function with the service-role key); can't be done safely from the browser.
- **Revoked-staff** still load their role client-side (their writes are blocked by the
  database regardless); cosmetic hardening.
- **Sync conflict policy** is last-write-wins via `updated_at`; fine for a class, can be
  refined later.
- Automated tests for the database RLS policies.
