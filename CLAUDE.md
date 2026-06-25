# CLAUDE.md — guidance for Claude Code working in this repo

This file is read automatically at the start of each session. Keep it short and current so
work starts fast (and cheap) without re-deriving the basics.

## What this is
"Records of HUMSS-202" — a mobile-first PWA for a class's fund transparency + attendance.
Source of truth is a Supabase (Postgres) backend; the app works offline and syncs when online.

## Tech stack
- Vite + React 18 + TypeScript, Tailwind CSS, `vite-plugin-pwa`.
- Backend: Supabase (Postgres + Auth + Row Level Security).
- Serverless admin actions: Vercel functions in `api/` (use the service-role key).
- Tests: Vitest + @testing-library/react.

## Commands
- `npm run dev` — local dev (note: `api/` functions do NOT run here, only on Vercel).
- `npm run build` — typecheck + production build (must stay green).
- `npm run test` — run the full Vitest suite (must stay green).

## Architecture / where things live
- `src/lib/` — data layer & pure logic (one responsibility per file): `supabase.ts`,
  `students.ts`, `funds.ts`, `attendance.ts`, `expenses.ts`, `calendar.ts`, `money.ts`,
  `grid.ts`, `roles.ts`, plus the offline engine `net.ts`, `outbox.ts`, `db.ts`, and
  `admin.ts` (calls the serverless API).
- `src/components/` — UI. Key shells: `App.tsx` (side nav + routing), `TransparencyTab.tsx`,
  `AdminPanel.tsx`. Tab components: `AttendanceTab`, `TransparencyGrid`, `Ledger`,
  `StaffEntry`, `CalendarTab`, `StaffRoster`, `Calculator`, `OfflineBanner`.
- `src/context/AuthContext.tsx` — session + role.
- `supabase/migrations/` — numbered SQL migrations (run in order in the Supabase SQL editor).
- `api/` — Vercel serverless functions (admin create-staff / reset-password).

## Conventions (follow these)
- **TDD**: write a failing test first, implement minimally, keep the suite green.
- **Money is stored as integer centavos** (₱2.00 = 200) — never floats. Use `money.ts`.
- **All writes go through `db.write()`** (offline outbox), except admin/staff role ops.
  Reads call `supabase` directly (the service worker caches them for offline).
- Keep files small and single-purpose. Don't change existing `data-testid`, input
  `placeholder`, `aria-label`, or button accessible names that tests rely on.
- `isolatedModules` is on → use `import type` for type-only imports.
- Commit in small, working steps. Don't commit secrets; `.env.local` is git-ignored.

## Roles
admin (full control + Admin tab) · treasurer/auditor (enter/remove data) · guest (view-only).
RLS enforces this in the database, not just the UI.

## Gotchas
- Confirmation emails are bypassed by migration `0004` (auto-confirm trigger).
- The service-role key lives ONLY in Vercel env vars — never import it client-side.
