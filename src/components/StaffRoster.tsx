import { useEffect, useState } from "react";
import { listStaff, setStaffRole, setStaffStatus, setStaffDark } from "../lib/staff";
import type { Staff } from "../lib/staff";
import { resetStaffPassword } from "../lib/admin";

export function StaffRoster() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [draft, setDraft] = useState<Record<string, { role: Staff["role"]; title: string }>>({});
  const [pw, setPw] = useState<Record<string, string>>({});
  const [note, setNote] = useState<Record<string, string>>({});

  async function load() {
    const s = await listStaff();
    // Show pending sign-ups first so the admin notices new people to approve.
    const rank = { pending: 0, active: 1, revoked: 2 } as const;
    s.sort((a, b) => rank[a.status] - rank[b.status] || a.email.localeCompare(b.email));
    setStaff(s);
    setDraft(Object.fromEntries(s.map((m) => [m.id, { role: m.role, title: m.title ?? "" }])));
  }

  useEffect(() => {
    void load();
  }, []);

  function update(id: string, patch: Partial<{ role: Staff["role"]; title: string }>) {
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function save(id: string) {
    const d = draft[id];
    await setStaffRole(id, d.role, d.title);
    setNote((n) => ({ ...n, [id]: "Saved." }));
  }

  async function toggleStatus(m: Staff) {
    const next = m.status === "active" ? "revoked" : "active";
    await setStaffStatus(m.id, next);
    await load();
  }

  // Approve a pending sign-up: save the chosen role/title, then activate them.
  async function approve(m: Staff) {
    const d = draft[m.id];
    await setStaffRole(m.id, d.role, d.title);
    await setStaffStatus(m.id, "active");
    await load();
  }

  async function changeTheme(id: string, value: boolean | null) {
    await setStaffDark(id, value);
    await load();
  }

  async function resetPw(id: string) {
    const newPw = pw[id] ?? "";
    await resetStaffPassword(id, newPw);
    setPw((p) => ({ ...p, [id]: "" }));
    setNote((n) => ({ ...n, [id]: "Password updated." }));
  }

  return (
    <div className="p-4">
      <h2 className="mb-3 text-lg font-bold text-violet-700">Staff</h2>
      <ul className="flex flex-col gap-4">
        {staff.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
              m.status === "pending" ? "border-amber-300 ring-2 ring-amber-100" : "border-violet-100"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium">
                {m.email}
                {m.status === "pending" && <span className="ml-2 text-xs text-amber-600">🆕 new sign-up</span>}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  m.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : m.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {m.status}
              </span>
            </div>

            <label className="block text-sm">
              Role for {m.email}
              <select
                aria-label={`Role for ${m.email}`}
                className="mt-1 w-full rounded-xl border border-violet-100 p-2"
                value={draft[m.id]?.role}
                onChange={(e) => update(m.id, { role: e.target.value as Staff["role"] })}
              >
                <option value="admin">admin</option>
                <option value="treasurer">treasurer</option>
                <option value="auditor">auditor</option>
              </select>
            </label>

            <label className="mt-2 block text-sm">
              Title for {m.email}
              <input
                aria-label={`Title for ${m.email}`}
                className="mt-1 w-full rounded-xl border border-violet-100 p-2"
                value={draft[m.id]?.title}
                onChange={(e) => update(m.id, { title: e.target.value })}
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              {m.status === "pending" ? (
                <button
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-1.5 text-sm font-medium text-white shadow-md"
                  onClick={() => approve(m)}
                >
                  ✓ Approve as {draft[m.id]?.role}
                </button>
              ) : (
                <button
                  className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-sm font-medium text-white shadow-md"
                  onClick={() => save(m.id)}
                >
                  Save {m.email}
                </button>
              )}
              <button
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-violet-50"
                onClick={() => toggleStatus(m)}
              >
                {m.status === "active" ? "Revoke" : "Restore"}
              </button>
            </div>

            <label className="mt-3 block text-sm">
              Theme for {m.email}
              <select
                aria-label={`Theme for ${m.email}`}
                className="mt-1 w-full rounded-xl border border-violet-100 p-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                value={m.dark_mode === null ? "auto" : m.dark_mode ? "dark" : "light"}
                onChange={(e) => {
                  const v = e.target.value;
                  void changeTheme(m.id, v === "auto" ? null : v === "dark");
                }}
              >
                <option value="auto">Auto (they choose)</option>
                <option value="light">Force light</option>
                <option value="dark">Force dark</option>
              </select>
            </label>

            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="text-sm">
                New password for {m.email}
                <input
                  type="password"
                  aria-label={`New password for ${m.email}`}
                  className="mt-1 block w-56 rounded-xl border border-violet-100 p-2"
                  value={pw[m.id] ?? ""}
                  onChange={(e) => setPw((p) => ({ ...p, [m.id]: e.target.value }))}
                />
              </label>
              <button
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-violet-50"
                onClick={() => resetPw(m.id)}
              >
                Set new password
              </button>
            </div>

            {note[m.id] && <p className="mt-2 text-sm text-emerald-600">{note[m.id]}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
