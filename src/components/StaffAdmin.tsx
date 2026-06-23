import { useEffect, useState } from "react";
import { listStaff, setStaffRole } from "../lib/staff";
import type { Staff } from "../lib/staff";

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
