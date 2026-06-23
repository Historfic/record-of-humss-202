# Transparency Report — Design Spec

**Date:** 2026-06-23
**Status:** Approved design, pre-implementation

## Purpose

An offline-first mobile web app (PWA) for a class to manage and openly display its
class fund, alongside daily attendance. Anyone can view the fund report
(transparency); only authorized staff can record data; one admin controls everything.

## Users & Roles

| Role | How they get in | Can do |
|---|---|---|
| **Admin** (the owner) | Email + password account | Everything: edit/delete any data, manage staff accounts and titles, settings |
| **Treasurer / Auditor** | Email + password account (created by themselves, visible to & managed by admin) | Add and remove data: payments, attendance, expenses. Cannot manage accounts or settings |
| **Guest** (classmates) | Type their name (no password) | View the Transparency report only. Name + visit is logged |

- Staff sign up; their accounts are saved centrally and visible to the admin in an **Admin tab**, where the admin assigns each staff member a **title/role**.
- Guest identity is a typed name, used for a "who viewed" log — not a security boundary.

## Platform & Architecture

- **Frontend:** Progressive Web App (PWA). Opened via a link in any phone browser
  (Android or iPhone), installable to the home screen, fullscreen, works offline.
- **Backend:** Supabase (Postgres database + auth + role enforcement).
- **Offline-first sync:**
  - All changes write to **local storage (IndexedDB) first** — the app never blocks on network.
  - Changes queue in an **outbox**; when online, the outbox is pushed to Supabase and
    remote changes are pulled down and merged.
  - **Conflict rule:** most-recent-change wins for a given field; money-related entries
    (payments, expenses) are kept in the ledger so nothing financial is silently lost.
    Admin can review/correct.
- **Mobile-first UI:** large tap targets, search-to-find-name, minimal taps to mark
  attendance or record a payment.

## Screens

### Tab 1 — Attendance (default tab)
- Alphabetical roster (shared with Transparency).
- Default status = **present** (green); only exceptions are stored/changed.
- Tap a student → quick actions: **Absent** (red), **Excused** (orange + note), **Cutting class** (red + ❗).
- Top bar: **name search** + date picker (defaults to today).
- Day / week / month toggle to review history.

### Tab 2 — Transparency (funds report)
- Grid: names down the left (alphabetical), time across the top.
- **Day / week / month toggle** for column granularity.
- Cell colors: 🟩 fully paid, 🟧 partial, 🟥 unpaid.
- Tap a cell → detail: amount paid, when, ₱2/day breakdown, and any special collections.
- Header shows **class total collected** and per-column totals.
- Tap a name → that student's full **payment record** + running balance.
- **History / ledger view:** chronological money-in (who paid, when) and money-out
  (what was bought, when, how much, by whom) + current class balance (total paid − total spent).
- **Guests see this tab read-only.**

### Tab 3 — Calendar / Notes (staff only)
- Projects / assignments / homework with **deadlines**.
- Calendar view + upcoming list. Visible/editable only to admin and staff the admin grants.

### Admin tab (admin only)
- View staff accounts, assign titles/roles, revoke access.

### Calculator (global)
- Floating button on every tab; opens a simple calculator overlay (e.g. to compute change)
  without leaving the app.

## Dues Model

- Base recurring due: **₱2 per school day** (= ₱10 per 5-day week).
- **Special collections** ("other payments"): ad-hoc dues with their own label, amount, and date.
- **Color logic:** green = paid ≥ due; orange = 0 < paid < due; red = paid 0.
  Week/month columns sum the dues underneath.

## Data Model (Supabase / Postgres)

- **students** — name, sort_order.
- **collections** — id, type (`daily` | `weekly` | `special`), label, amount, date.
- **payments** — id, student_id, collection_id, amount_paid, paid_at, recorded_by.
- **attendance** — id, student_id, date, status (`present` | `absent` | `excused` | `cutting`), note. (Only exceptions stored.)
- **expenses** — id, description, amount, date, recorded_by. (Recordable by admin + treasurer + auditor; editable/deletable by admin only.)
- **users** — id, email, role (`admin` | `treasurer` | `auditor`), title, status.
- **guest_log** — name, visited_at.
- **calendar_notes** — id, title, description, due_date, created_by.

## Cross-cutting Rules

- **Soft deletes:** removed records are hidden but retained for history/audit traceability.
- **Role enforcement** lives in the backend (Supabase Row Level Security), not just the UI.
- **Money safety:** payments and expenses are append-style ledger entries; corrections
  are new entries or admin edits, never silent loss.

## Out of Scope (for now)

- Native app store distribution (Android APK / iOS App Store).
- Push notifications.
- Per-student differing daily due amounts (current model: same due for all, special
  collections handle exceptions).
