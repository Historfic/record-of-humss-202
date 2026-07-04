# Records of HUMSS-202

A high-performance PWA for classroom management, focused on real-time fund transparency and attendance tracking. Built for offline-first reliability.

## The Problem
Manual class record-keeping is prone to error, lack of transparency, and friction. 

## The Solution
- **Offline-First:** Full capability without a signal; auto-sync via Supabase + Outbox pattern.
- **Transparency-First:** Every peso accounted for, visible to the whole class without login barriers.
- **Mobile-Native:** Designed for thumb-first navigation and rapid data entry.

## Tech Stack
- **Frontend:** Vite + React 18 + TypeScript + Tailwind.
- **Backend:** Supabase (Postgres RLS + Auth).
- **Architecture:** Serverless (Vercel) for admin-privilege operations.
- **Offline Strategy:** Optimistic updates with a local outbox queue.

## Quick Start
1. `npm install`
2. Create Supabase project & apply migrations in `supabase/migrations/`.
3. Create `.env.local`:
   `VITE_SUPABASE_URL=...`
   `VITE_SUPABASE_ANON_KEY=...`
4. `npm run dev`