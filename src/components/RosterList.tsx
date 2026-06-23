import { useEffect, useState } from "react";
import { listStudents } from "../lib/students";
import type { Student } from "../lib/students";

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
