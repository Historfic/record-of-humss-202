import { useEffect, useState } from "react";
import { StaffRoster } from "./StaffRoster";
import { Ledger } from "./Ledger";
import { createStaff } from "../lib/admin";
import { listGuestVisits } from "../lib/guest";
import type { GuestVisit } from "../lib/guest";

type SubTab = "Staff" | "Add staff" | "Who viewed" | "History";

function AddStaffForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"treasurer" | "auditor" | "admin">("treasurer");
  const [title, setTitle] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(false);
    setErr("");
    try {
      await createStaff({ email, password, role, title });
      setOk(true);
      setEmail("");
      setPassword("");
      setTitle("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-bold text-violet-700">Add staff</h2>
      <label className="text-sm">
        Email
        <input
          aria-label="Email"
          type="email"
          className="mt-1 w-full rounded-xl border border-violet-100 p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="text-sm">
        Password
        <input
          aria-label="Password"
          type="text"
          className="mt-1 w-full rounded-xl border border-violet-100 p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label className="text-sm">
        Role
        <select
          aria-label="Role"
          className="mt-1 w-full rounded-xl border border-violet-100 p-2"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
        >
          <option value="admin">admin</option>
          <option value="treasurer">treasurer</option>
          <option value="auditor">auditor</option>
        </select>
      </label>
      <label className="text-sm">
        Title
        <input
          aria-label="Title"
          className="mt-1 w-full rounded-xl border border-violet-100 p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className="self-start rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-sm font-medium text-white shadow-md"
      >
        Create account
      </button>
      {ok && <p className="text-sm text-emerald-600">Account created — they can log in now.</p>}
      {err && <p className="text-sm text-rose-600">{err}</p>}
      <p className="text-xs text-slate-400">
        You set the password here, so you'll know it. Passwords can never be viewed later, only reset.
      </p>
    </form>
  );
}

function WhoViewed() {
  const [visits, setVisits] = useState<GuestVisit[]>([]);

  useEffect(() => {
    listGuestVisits().then(setVisits).catch(() => {});
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-3 text-lg font-bold text-violet-700">Classmates who viewed the report</h2>
      <ul className="flex flex-col gap-2">
        {visits.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between rounded-2xl border border-violet-100 bg-white p-3 shadow-sm"
          >
            <span className="font-medium">{v.name}</span>
            <span className="text-sm text-slate-500">
              {new Date(v.visited_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminPanel() {
  const [sub, setSub] = useState<SubTab>("Staff");
  const tabs: SubTab[] = ["Staff", "Add staff", "Who viewed", "History"];

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-4 pb-0">
        {tabs.map((t) => {
          const active = sub === t;
          return (
            <button
              key={t}
              onClick={() => setSub(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md"
                  : "bg-white text-slate-600 shadow-sm hover:bg-violet-50"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div>
        {sub === "Staff" && <StaffRoster />}
        {sub === "Add staff" && <AddStaffForm />}
        {sub === "Who viewed" && <WhoViewed />}
        {sub === "History" && <Ledger />}
      </div>
    </div>
  );
}
