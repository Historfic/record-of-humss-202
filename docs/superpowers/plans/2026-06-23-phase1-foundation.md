# Transparency Report — Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A phone-installable PWA where staff sign up / log in with roles, guests enter a name to view, and an alphabetical student roster is shown — backed by Supabase.

**Architecture:** Vite + React + TypeScript single-page PWA. Supabase provides Postgres, auth, and Row Level Security (RLS) for role enforcement. A thin typed data layer (`src/lib`) wraps the Supabase client so later phases (and the offline engine) have one place to swap. UI is mobile-first with Tailwind.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, `@supabase/supabase-js`, `vite-plugin-pwa`, Vitest + @testing-library/react.

---

## File Structure

- `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html` — project scaffold.
- `.env.example` / `.env.local` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `supabase/migrations/0001_foundation.sql` — tables + RLS for `users`, `students`, `guest_log`.
- `src/lib/supabase.ts` — singleton Supabase client.
- `src/lib/roles.ts` — role types + helpers (`canEditData`, `isAdmin`). Pure, unit-tested.
- `src/lib/students.ts` — `listStudents`, `addStudent` (sorted alphabetically).
- `src/lib/staff.ts` — `listStaff`, `setStaffRole`.
- `src/lib/guest.ts` — `logGuestVisit`.
- `src/context/AuthContext.tsx` — current session + role, exposed via hook.
- `src/components/RosterList.tsx` — alphabetical roster view.
- `src/components/StaffAdmin.tsx` — admin-only staff management.
- `src/components/GuestGate.tsx` — name entry for guests.
- `src/App.tsx` — routes between login / guest gate / tabs.
- `src/main.tsx` — entry, registers PWA + AuthProvider.
- Tests colocated as `*.test.ts(x)` next to each file.

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`, `.gitignore`, `.env.example`

- [ ] **Step 1: Scaffold with Vite**

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p
```

- [ ] **Step 2: Configure Tailwind**

In `tailwind.config.js` set:

```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Configure Vitest + PWA in `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Transparency Report",
        short_name: "Fund",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#16a34a",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  test: { environment: "jsdom", globals: true, setupFiles: "./src/test-setup.ts" },
});
```

- [ ] **Step 4: Add test setup + npm scripts**

Create `src/test-setup.ts`:

```ts
import "@testing-library/jest-dom";
```

In `package.json` add to `"scripts"`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 5: Add `.env.example`**

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add `.env.local` to `.gitignore`.

- [ ] **Step 6: Verify build runs**

Run: `npm run build`
Expected: build completes with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React TS PWA project"
```

---

## Task 2: Roles helper (pure logic, TDD)

**Files:**
- Create: `src/lib/roles.ts`
- Test: `src/lib/roles.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { canEditData, isAdmin, Role } from "./roles";

describe("roles", () => {
  it("admin can edit data and is admin", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(canEditData("admin")).toBe(true);
  });
  it("treasurer and auditor can edit data but are not admin", () => {
    for (const r of ["treasurer", "auditor"] as Role[]) {
      expect(canEditData(r)).toBe(true);
      expect(isAdmin(r)).toBe(false);
    }
  });
  it("guest can neither edit nor admin", () => {
    expect(canEditData("guest")).toBe(false);
    expect(isAdmin("guest")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/roles.test.ts`
Expected: FAIL — cannot find module `./roles`.

- [ ] **Step 3: Write minimal implementation**

```ts
export type Role = "admin" | "treasurer" | "auditor" | "guest";

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

export function canEditData(role: Role): boolean {
  return role === "admin" || role === "treasurer" || role === "auditor";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/roles.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/roles.ts src/lib/roles.test.ts
git commit -m "feat: add role permission helpers"
```

---

## Task 3: Supabase schema + RLS migration

**Files:**
- Create: `supabase/migrations/0001_foundation.sql`

- [ ] **Step 1: Write the migration**

```sql
-- users: one row per staff account, linked to auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'auditor' check (role in ('admin','treasurer','auditor')),
  title text,
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  deleted boolean not null default false
);

create table public.guest_log (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visited_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.guest_log enable row level security;

-- helper: is the current auth user an admin?
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists(select 1 from public.users u where u.id = auth.uid() and u.role = 'admin' and u.status = 'active');
$$;

-- helper: is the current auth user active staff?
create or replace function public.is_staff() returns boolean
language sql security definer stable as $$
  select exists(select 1 from public.users u where u.id = auth.uid() and u.status = 'active');
$$;

-- users policies
create policy users_select_self_or_admin on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy users_insert_self on public.users
  for insert with check (id = auth.uid());
create policy users_update_admin on public.users
  for update using (public.is_admin());

-- students: anyone (incl. anon) may read non-deleted; only staff write
create policy students_select_all on public.students
  for select using (deleted = false);
create policy students_write_staff on public.students
  for all using (public.is_staff()) with check (public.is_staff());

-- guest_log: anyone may insert their visit; only admin reads
create policy guest_log_insert_any on public.guest_log
  for insert with check (true);
create policy guest_log_select_admin on public.guest_log
  for select using (public.is_admin());
```

- [ ] **Step 2: Apply the migration**

In the Supabase dashboard SQL editor (or `supabase db push` if CLI is set up), run the migration. Confirm the three tables exist under **Table Editor**.

- [ ] **Step 3: Seed the admin**

After you (the owner) sign up in Task 6, run in SQL editor:

```sql
update public.users set role = 'admin', title = 'Owner' where email = 'OWNER_EMAIL_HERE';
```

(Replace with your real email. This is the only manual bootstrap step.)

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_foundation.sql
git commit -m "feat: add foundation schema and RLS policies"
```

---

## Task 4: Supabase client + data-layer modules

**Files:**
- Create: `src/lib/supabase.ts`, `src/lib/students.ts`, `src/lib/staff.ts`, `src/lib/guest.ts`
- Test: `src/lib/students.test.ts`

- [ ] **Step 1: Write the client**

`src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);
```

- [ ] **Step 2: Write the failing test for students sorting**

`src/lib/students.test.ts` (tests pure sorting, mocking the client):

```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase", () => ({ supabase: {} }));
import { sortStudents, Student } from "./students";

describe("sortStudents", () => {
  it("orders alphabetically by name, case-insensitive", () => {
    const input: Student[] = [
      { id: "1", name: "bautista", sort_order: 0 },
      { id: "2", name: "Abad", sort_order: 0 },
      { id: "3", name: "Cruz", sort_order: 0 },
    ];
    expect(sortStudents(input).map((s) => s.name)).toEqual(["Abad", "bautista", "Cruz"]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/students.test.ts`
Expected: FAIL — `sortStudents` not exported.

- [ ] **Step 4: Implement `src/lib/students.ts`**

```ts
import { supabase } from "./supabase";

export interface Student {
  id: string;
  name: string;
  sort_order: number;
}

export function sortStudents(students: Student[]): Student[] {
  return [...students].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id,name,sort_order")
    .eq("deleted", false);
  if (error) throw error;
  return sortStudents(data ?? []);
}

export async function addStudent(name: string): Promise<void> {
  const { error } = await supabase.from("students").insert({ name });
  if (error) throw error;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/students.test.ts`
Expected: PASS.

- [ ] **Step 6: Implement `src/lib/staff.ts`**

```ts
import { supabase } from "./supabase";
import { Role } from "./roles";

export interface Staff {
  id: string;
  email: string;
  role: Exclude<Role, "guest">;
  title: string | null;
  status: "active" | "revoked";
}

export async function listStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,role,title,status");
  if (error) throw error;
  return data ?? [];
}

export async function setStaffRole(
  id: string,
  role: Staff["role"],
  title: string
): Promise<void> {
  const { error } = await supabase.from("users").update({ role, title }).eq("id", id);
  if (error) throw error;
}

export async function setStaffStatus(id: string, status: Staff["status"]): Promise<void> {
  const { error } = await supabase.from("users").update({ status }).eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 7: Implement `src/lib/guest.ts`**

```ts
import { supabase } from "./supabase";

export async function logGuestVisit(name: string): Promise<void> {
  const { error } = await supabase.from("guest_log").insert({ name });
  if (error) throw error;
}
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/
git commit -m "feat: add supabase client and data-layer modules"
```

---

## Task 5: Auth context

**Files:**
- Create: `src/context/AuthContext.tsx`
- Test: `src/context/AuthContext.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const getSession = vi.fn();
const onAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe() {} } } }));
const from = vi.fn(() => ({
  select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin", title: "Owner" }, error: null }) }) }),
}));
vi.mock("../lib/supabase", () => ({
  supabase: { auth: { getSession, onAuthStateChange }, from },
}));

import { AuthProvider, useAuth } from "./AuthContext";

function Probe() {
  const { role, loading } = useAuth();
  return <div>{loading ? "loading" : role}</div>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "u1", email: "o@x.com" } } } });
  });
  it("exposes the staff role for a logged-in user", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("admin")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/context/AuthContext.test.tsx`
Expected: FAIL — cannot find module `./AuthContext`.

- [ ] **Step 3: Implement `src/context/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { Role } from "../lib/roles";

interface AuthState {
  role: Role | null;        // null = not signed in as staff
  guestName: string | null; // set when browsing as a guest
  userId: string | null;
  loading: boolean;
  setGuestName: (name: string) => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRole(uid: string) {
    const { data } = await supabase.from("users").select("role").eq("id", uid).single();
    setRole((data?.role as Role) ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (user) { setUserId(user.id); await loadRole(user.id); }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const user = session?.user;
      setUserId(user?.id ?? null);
      if (user) await loadRole(user.id);
      else setRole(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setRole(null);
    setUserId(null);
  }

  return (
    <Ctx.Provider value={{ role, guestName, userId, loading, setGuestName, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/context/AuthContext.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/
git commit -m "feat: add auth context with role loading"
```

---

## Task 6: Login + sign-up form

**Files:**
- Create: `src/components/AuthForm.tsx`
- Test: `src/components/AuthForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
const signUp = vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
const insert = vi.fn().mockResolvedValue({ error: null });
vi.mock("../lib/supabase", () => ({
  supabase: { auth: { signInWithPassword, signUp }, from: () => ({ insert }) },
}));
import { AuthForm } from "./AuthForm";

describe("AuthForm", () => {
  it("signs in with entered credentials", async () => {
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "o@x.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({ email: "o@x.com", password: "secret12" })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/AuthForm.test.tsx`
Expected: FAIL — cannot find module `./AuthForm`.

- [ ] **Step 3: Implement `src/components/AuthForm.tsx`**

```tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); return; }
      if (data.user) {
        // create the staff profile row (defaults to auditor; admin assigns real role)
        await supabase.from("users").insert({ id: data.user.id, email });
      }
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 flex max-w-xs flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">{mode === "login" ? "Staff Log In" : "Staff Sign Up"}</h1>
      <label className="flex flex-col text-sm">Email
        <input className="rounded border p-2" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="flex flex-col text-sm">Password
        <input className="rounded border p-2" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="rounded bg-green-600 p-2 text-white" type="submit">
        {mode === "login" ? "Log In" : "Sign Up"}
      </button>
      <button type="button" className="text-sm text-gray-500"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/AuthForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AuthForm.tsx src/components/AuthForm.test.tsx
git commit -m "feat: add staff login and signup form"
```

---

## Task 7: Guest gate

**Files:**
- Create: `src/components/GuestGate.tsx`
- Test: `src/components/GuestGate.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const logGuestVisit = vi.fn().mockResolvedValue(undefined);
vi.mock("../lib/guest", () => ({ logGuestVisit }));
import { GuestGate } from "./GuestGate";

describe("GuestGate", () => {
  it("logs the visit and reports the entered name", async () => {
    const onEnter = vi.fn();
    render(<GuestGate onEnter={onEnter} />);
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Juan" } });
    fireEvent.click(screen.getByRole("button", { name: /view report/i }));
    await waitFor(() => expect(logGuestVisit).toHaveBeenCalledWith("Juan"));
    expect(onEnter).toHaveBeenCalledWith("Juan");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/GuestGate.test.tsx`
Expected: FAIL — cannot find module `./GuestGate`.

- [ ] **Step 3: Implement `src/components/GuestGate.tsx`**

```tsx
import { useState } from "react";
import { logGuestVisit } from "../lib/guest";

export function GuestGate({ onEnter }: { onEnter: (name: string) => void }) {
  const [name, setName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await logGuestVisit(trimmed);
    onEnter(trimmed);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 flex max-w-xs flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">View the Fund Report</h1>
      <label className="flex flex-col text-sm">Your name
        <input className="rounded border p-2" value={name}
          onChange={(e) => setName(e.target.value)} required />
      </label>
      <button className="rounded bg-green-600 p-2 text-white" type="submit">View Report</button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/GuestGate.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/GuestGate.tsx src/components/GuestGate.test.tsx
git commit -m "feat: add guest name gate with visit logging"
```

---

## Task 8: Roster list

**Files:**
- Create: `src/components/RosterList.tsx`
- Test: `src/components/RosterList.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../lib/students", () => ({
  listStudents: vi.fn().mockResolvedValue([
    { id: "1", name: "Abad", sort_order: 0 },
    { id: "2", name: "Cruz", sort_order: 0 },
  ]),
}));
import { RosterList } from "./RosterList";

describe("RosterList", () => {
  it("renders students alphabetically", async () => {
    render(<RosterList />);
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    expect(screen.getByText("Cruz")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/RosterList.test.tsx`
Expected: FAIL — cannot find module `./RosterList`.

- [ ] **Step 3: Implement `src/components/RosterList.tsx`**

```tsx
import { useEffect, useState } from "react";
import { listStudents, Student } from "../lib/students";

export function RosterList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => { listStudents().then(setStudents); }, []);

  const shown = students.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-4">
      <input className="mb-3 w-full rounded border p-2" placeholder="Search name…"
        value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="divide-y">
        {shown.map((s) => (
          <li key={s.id} className="py-2">{s.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/RosterList.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/RosterList.tsx src/components/RosterList.test.tsx
git commit -m "feat: add searchable alphabetical roster list"
```

---

## Task 9: Staff admin panel (admin only)

**Files:**
- Create: `src/components/StaffAdmin.tsx`
- Test: `src/components/StaffAdmin.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const setStaffRole = vi.fn().mockResolvedValue(undefined);
vi.mock("../lib/staff", () => ({
  listStaff: vi.fn().mockResolvedValue([
    { id: "u2", email: "t@x.com", role: "auditor", title: null, status: "active" },
  ]),
  setStaffRole,
  setStaffStatus: vi.fn(),
}));
import { StaffAdmin } from "./StaffAdmin";

describe("StaffAdmin", () => {
  it("assigns a new role and title to a staff member", async () => {
    render(<StaffAdmin />);
    await waitFor(() => expect(screen.getByText("t@x.com")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/role for t@x.com/i), { target: { value: "treasurer" } });
    fireEvent.change(screen.getByLabelText(/title for t@x.com/i), { target: { value: "Treasurer" } });
    fireEvent.click(screen.getByRole("button", { name: /save t@x.com/i }));
    await waitFor(() =>
      expect(setStaffRole).toHaveBeenCalledWith("u2", "treasurer", "Treasurer")
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/StaffAdmin.test.tsx`
Expected: FAIL — cannot find module `./StaffAdmin`.

- [ ] **Step 3: Implement `src/components/StaffAdmin.tsx`**

```tsx
import { useEffect, useState } from "react";
import { listStaff, setStaffRole, Staff } from "../lib/staff";

export function StaffAdmin() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [draft, setDraft] = useState<Record<string, { role: Staff["role"]; title: string }>>({});

  useEffect(() => {
    listStaff().then((s) => {
      setStaff(s);
      setDraft(Object.fromEntries(s.map((m) => [m.id, { role: m.role, title: m.title ?? "" }])));
    });
  }, []);

  function update(id: string, patch: Partial<{ role: Staff["role"]; title: string }>) {
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(id: string) {
    const d = draft[id];
    await setStaffRole(id, d.role, d.title);
  }

  return (
    <div className="p-4">
      <h2 className="mb-3 text-lg font-bold">Staff</h2>
      <ul className="flex flex-col gap-4">
        {staff.map((m) => (
          <li key={m.id} className="rounded border p-3">
            <p className="font-medium">{m.email}</p>
            <label className="block text-sm">Role for {m.email}
              <select aria-label={`Role for ${m.email}`} className="mt-1 w-full rounded border p-2"
                value={draft[m.id]?.role}
                onChange={(e) => update(m.id, { role: e.target.value as Staff["role"] })}>
                <option value="admin">admin</option>
                <option value="treasurer">treasurer</option>
                <option value="auditor">auditor</option>
              </select>
            </label>
            <label className="mt-2 block text-sm">Title for {m.email}
              <input aria-label={`Title for ${m.email}`} className="mt-1 w-full rounded border p-2"
                value={draft[m.id]?.title}
                onChange={(e) => update(m.id, { title: e.target.value })} />
            </label>
            <button className="mt-2 rounded bg-green-600 px-3 py-1 text-white"
              onClick={() => save(m.id)}>Save {m.email}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/StaffAdmin.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/StaffAdmin.tsx src/components/StaffAdmin.test.tsx
git commit -m "feat: add admin-only staff management panel"
```

---

## Task 10: App shell — wire it together

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Wire AuthProvider in `src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

- [ ] **Step 2: Implement routing in `src/App.tsx`**

Logic: while `loading`, show nothing. If staff `role` set → show roster + (admin only) staff panel + sign out. Else if `guestName` set → show roster (read-only). Else → landing with `AuthForm` and a "Continue as guest" path to `GuestGate`.

```tsx
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { isAdmin } from "./lib/roles";
import { AuthForm } from "./components/AuthForm";
import { GuestGate } from "./components/GuestGate";
import { RosterList } from "./components/RosterList";
import { StaffAdmin } from "./components/StaffAdmin";

export default function App() {
  const { role, guestName, loading, setGuestName, signOut } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [tab, setTab] = useState<"roster" | "staff">("roster");

  if (loading) return null;

  // Signed-in staff
  if (role) {
    return (
      <div>
        <header className="flex items-center justify-between border-b p-3">
          <strong>Transparency Report</strong>
          <button className="text-sm text-gray-500" onClick={signOut}>Sign out</button>
        </header>
        {isAdmin(role) && (
          <nav className="flex gap-2 border-b p-2 text-sm">
            <button onClick={() => setTab("roster")}>Roster</button>
            <button onClick={() => setTab("staff")}>Staff</button>
          </nav>
        )}
        {tab === "staff" && isAdmin(role) ? <StaffAdmin /> : <RosterList />}
      </div>
    );
  }

  // Guest viewing
  if (guestName) {
    return (
      <div>
        <header className="border-b p-3"><strong>Transparency Report</strong> — guest: {guestName}</header>
        <RosterList />
      </div>
    );
  }

  // Landing
  if (guestMode) return <GuestGate onEnter={setGuestName} />;
  return (
    <div>
      <AuthForm />
      <div className="mt-4 text-center">
        <button className="text-sm text-green-700 underline" onClick={() => setGuestMode(true)}>
          Continue as guest (view only)
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: all tests pass.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`. In the browser: sign up as the owner, run the Task 3 Step 3 SQL to make yourself admin, reload, confirm the Staff tab appears. Open in a second/incognito window, "Continue as guest", enter a name, confirm the roster shows read-only. Add a couple of students via Supabase Table Editor and confirm they appear sorted.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: wire app shell routing for staff, admin, and guest"
```

---

## Self-Review Notes (spec coverage)

- Staff accounts + roles + admin management → Tasks 3, 5, 6, 9. ✅
- Guest name entry + visit log → Tasks 3, 4, 7. ✅
- Alphabetical roster shared by tabs → Tasks 4, 8. ✅
- PWA installable on phones → Task 1 (manifest + plugin). ✅
- Role enforcement in backend (RLS) → Task 3. ✅
- **Deferred to later phases (by design):** offline/IndexedDB sync (Phase 4), funds grid/calculator (Phase 2), attendance (Phase 3), calendar (Phase 5). Phase 1 runs online against Supabase; the `src/lib` data layer is the seam where the offline engine slots in.

**Note:** PWA icons (`public/icon-192.png`, `public/icon-512.png`) are referenced by the manifest — add any two placeholder PNGs of those sizes during Task 1 so the build is clean.
