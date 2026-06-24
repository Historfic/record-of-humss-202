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
   - `supabase/migrations/0004_auto_confirm.sql`  ← makes sign-ups work instantly, no email
   Verify in **Table Editor**: you should see `users, students, collections, payments,
   attendance, expenses, calendar_notes, guest_log`.
3. **Email confirmation:** you do NOT need to touch any dashboard toggle — migration `0004`
   auto-confirms every new account in the database, so staff can log in the moment they
   sign up. (No email is required and there's nothing to click at school.)

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

## E. Put it online so classmates can use it (deploy to Vercel, named "record")

`localhost` only works on YOUR computer. To share a link with the class, deploy (free).

### E1. Push to GitHub first (Section H), then:

1. Go to https://vercel.com → sign in with GitHub → **Add New → Project**.
2. **Import** your `record` GitHub repo.
3. Project **Name: `record`**. Framework preset: **Vite** (auto-detected; build `npm run build`,
   output `dist`).
4. **Environment Variables** — add THREE (the third powers the admin "Add staff" / "Reset
   password" buttons and must stay server-side):

   | Name | Value | Where to find it |
   |---|---|---|
   | `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` | Supabase → Settings → API → Project URL |
   | `VITE_SUPABASE_ANON_KEY` | the **anon public** key | Supabase → Settings → API |
   | `SUPABASE_URL` | same as VITE_SUPABASE_URL | (same) |
   | `SUPABASE_SERVICE_ROLE_KEY` | the **service_role** key ⚠️ secret | Supabase → Settings → API → service_role |

   ⚠️ The **service_role** key is powerful — only paste it into Vercel's env vars, never into
   `.env.local`, the app, or anywhere public.
5. **Deploy.** You get `https://record-xxxx.vercel.app`.
6. Share that link. On a phone: open it → browser menu → **Add to Home Screen** → installs
   like an app (icon, fullscreen, offline).

> Note: the admin **Add staff** and **Reset password** buttons only work on the deployed
> Vercel site (they call a secure server function). Everything else also works in `npm run dev`.

## F. How offline works (what to expect)

- **Viewing offline:** once the app has loaded online at least once, the report still opens
  with no internet (shows the last-synced data).
- **Editing offline:** marking attendance / recording payments offline is **saved on the
  phone** and a yellow bar shows "Offline — N change(s) will sync." When internet returns,
  it **auto-syncs** and the bar turns blue ("Syncing…") then disappears.
- Tip: each staff member should open the app online once on their phone before relying on
  offline use, so the app and data are cached.

## G. Who needs an account vs. who doesn't

- **Classmates = guests = NO account, NO email.** They open your deployed link, tap
  **"Continue as guest (view only)"**, type their name, and see the Transparency report.
  That's the only thing they ever do.
- **Only the treasurer and auditor** make accounts:
  1. They open your link and **Sign up** (email + password). Thanks to migration `0004`
     they're logged in immediately — no confirmation step.
  2. Their account appears in your **Staff** tab → set their **role** (treasurer/auditor)
     and **title** → Save.

## H. Push to GitHub (needed for deploy + backup)

1. On https://github.com → **New repository** → name it **`record`** → keep it empty
   (no README) → **Create**.
2. In the VS Code terminal (from the project folder), run — replacing YOUR-USERNAME:
   ```
   git remote add origin https://github.com/YOUR-USERNAME/record.git
   git push -u origin master
   ```
   (If GitHub asks you to sign in, use the browser popup or a Personal Access Token.)
3. Done — now do Section E to deploy it on Vercel.

## I. Using the Admin tab (instead of Supabase)

Once deployed, the 👑 **Admin** tab is your control center — you rarely need Supabase again:
- **Staff** — change roles/titles, **Revoke/Restore** access, **Set new password** for anyone.
- **Add staff** — create a treasurer/auditor account; you type their password (so you know it).
- **Who viewed** — the log of classmates who opened the report (name + time).
- **History** — full money-in / money-out ledger and balance.

Passwords can never be *shown* (they're stored scrambled, by design) — but you set them when
creating an account and can reset them anytime, so you always control access.

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
