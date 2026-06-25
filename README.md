# Records of HUMSS-202

A mobile-first web app (PWA) for a class to track its **fund transparency** and **attendance**,
usable on any phone, **online or offline**.

## Features
- **Attendance** — roster defaults everyone to present; tap to mark Absent / Excused (+note) /
  Cutting class. Search by name. Day/week/month history.
- **Transparency** — a color grid (🟩 paid · 🟧 partial · 🟥 unpaid) of who paid what, with a
  Day/Week/Month toggle, class totals, and tap-for-detail.
  - **History** — every payment in and every expense out, with the running balance.
  - **Record** (staff) — add students, create dues, record payments.
- **Calculator** — floating, on every screen (compute change without leaving the app).
- **Calendar** (staff) — projects/assignments/homework with deadlines.
- **Admin control center** (owner) — manage staff & roles, create accounts, reset passwords,
  see who viewed the report, and review the full fund history.
- **Offline** — view the report and record changes with no internet; it auto-syncs on reconnect.

## Access roles
- **Owner / admin** — can do everything.
- **Treasurer / auditor** — can add and remove data.
- **Guests (classmates)** — type a name and view the report. No account needed.

## Tech
Vite · React · TypeScript · Tailwind · Supabase (Postgres + Auth + RLS) · Vercel (hosting +
serverless admin API) · PWA (installable, offline).

## Setup & deploy
See **[SETUP.md](SETUP.md)** for the full step-by-step (Supabase project, migrations, env
vars, GitHub, and Vercel deploy). Quick local start:

```bash
npm install
npm run dev
```

(You'll need a Supabase project and a `.env.local` with `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` — see SETUP.md.)

## Development
```bash
npm run test    # run the test suite
npm run build   # typecheck + production build
```
See **[CLAUDE.md](CLAUDE.md)** for architecture and contributor conventions.
