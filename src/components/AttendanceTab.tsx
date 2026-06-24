import { useEffect, useMemo, useState } from "react";
import { listStudents } from "../lib/students";
import { listAttendance, setAttendance, statusFor } from "../lib/attendance";
import type { AttStatus, AttendanceRecord } from "../lib/attendance";

interface Student {
  id: string;
  name: string;
  sort_order: number;
}

const STATUS_META: Record<AttStatus, { label: string; dot: string; mark?: string }> = {
  present: { label: "Present", dot: "bg-green-500" },
  absent: { label: "Absent", dot: "bg-red-500" },
  excused: { label: "Excused", dot: "bg-orange-500" },
  cutting: { label: "Cutting", dot: "bg-red-500", mark: "❗" },
};

const STATUS_ORDER: AttStatus[] = ["present", "absent", "excused", "cutting"];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AttendanceTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState<string>(today());
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;
    listStudents().then((s) => {
      if (active) setStudents(s);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    listAttendance(date).then((r) => {
      if (active) setRecords(r);
    });
    return () => {
      active = false;
    };
  }, [date]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.name.toLowerCase().includes(q));
  }, [students, search]);

  async function choose(studentId: string, status: AttStatus) {
    const noteVal = status === "excused" ? note.trim() || null : null;
    await setAttendance(studentId, date, status, noteVal);
    const fresh = await listAttendance(date);
    setRecords(fresh);
    setOpenId(null);
    setNote("");
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-col gap-2 bg-white p-3 shadow">
        <input
          type="date"
          data-testid="att-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border p-2 text-base"
        />
        <input
          type="search"
          placeholder="Search name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border p-2 text-base"
        />
      </div>

      <ul className="flex flex-col divide-y">
        {filtered.map((student) => {
          const status = statusFor(records, student.id);
          const meta = STATUS_META[status];
          const isOpen = openId === student.id;
          return (
            <li key={student.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => {
                  setOpenId(isOpen ? null : student.id);
                  setNote("");
                }}
                className="flex items-center gap-3 p-4 text-left"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full ${meta.dot}`}
                  aria-hidden="true"
                />
                <span className="flex-1 text-lg">{student.name}</span>
                <span className="text-sm text-gray-600">
                  {meta.label}
                  {meta.mark ?? ""}
                </span>
              </button>

              {isOpen && (
                <div className="flex flex-col gap-2 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => choose(student.id, s)}
                        className="rounded bg-gray-100 p-4 text-base font-medium"
                      >
                        {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Reason…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="rounded border p-2 text-base"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
