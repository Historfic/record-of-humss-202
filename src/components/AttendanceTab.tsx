import { useEffect, useMemo, useState } from "react";
import { listStudents } from "../lib/students";
import { listAttendanceBetween, setAttendance } from "../lib/attendance";
import type { AttStatus, AttendanceRecord } from "../lib/attendance";
import { weekdaysOfMonth, monthLabel, shiftMonth } from "../lib/dates";

interface Student {
  id: string;
  name: string;
  sort_order: number;
}

const STATUS_META: Record<AttStatus, { label: string; letter: string; bg: string }> = {
  present: { label: "Present", letter: "P", bg: "bg-green-500" },
  absent: { label: "Absent", letter: "A", bg: "bg-red-500" },
  excused: { label: "Excused", letter: "E", bg: "bg-orange-400" },
  cutting: { label: "Cutting", letter: "!", bg: "bg-red-600" },
};

const STATUS_ORDER: AttStatus[] = ["present", "absent", "excused", "cutting"];

const now = new Date();
const todayIso = now.toISOString().slice(0, 10);
const pad2 = (n: number) => String(n).padStart(2, "0");

export function AttendanceTab({
  initialYear = now.getFullYear(),
  initialMonth = now.getMonth(),
}: {
  initialYear?: number;
  initialMonth?: number;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [year, setYear] = useState(initialYear);
  const [monthIndex, setMonthIndex] = useState(initialMonth);
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<{ studentId: string; date: string } | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => weekdaysOfMonth(year, monthIndex), [year, monthIndex]);

  useEffect(() => {
    listStudents().then(setStudents);
  }, []);

  async function refresh() {
    if (days.length === 0) return;
    setRecords(await listAttendanceBetween(days[0], days[days.length - 1]));
  }

  useEffect(() => {
    let active = true;
    if (days.length) {
      listAttendanceBetween(days[0], days[days.length - 1]).then((r) => {
        if (active) setRecords(r);
      });
    }
    return () => {
      active = false;
    };
  }, [days]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.filter((s) => s.name.toLowerCase().includes(q)) : students;
  }, [students, search]);

  function move(delta: number) {
    const next = shiftMonth(year, monthIndex, delta);
    setYear(next.year);
    setMonthIndex(next.monthIndex);
    setSel(null);
  }

  async function choose(status: AttStatus) {
    if (!sel) return;
    setError(null);
    const noteVal = status === "excused" ? note.trim() || null : null;
    try {
      await setAttendance(sel.studentId, sel.date, status, noteVal);
      await refresh();
      setSel(null);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Are you signed in as staff?");
    }
  }

  const selStudent = sel && students.find((s) => s.id === sel.studentId);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 flex flex-col gap-2 bg-white/90 p-3 shadow backdrop-blur dark:bg-slate-900/90">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => move(-1)} className="rounded-lg bg-slate-100 px-3 py-1 text-lg dark:bg-slate-700 dark:text-slate-200">‹</button>
          <span data-testid="att-month" className="font-semibold">{monthLabel(year, monthIndex)}</span>
          <button onClick={() => move(1)} className="rounded-lg bg-slate-100 px-3 py-1 text-lg dark:bg-slate-700 dark:text-slate-200">›</button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            aria-label="Jump to month"
            value={`${year}-${pad2(monthIndex + 1)}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              if (y && m) { setYear(y); setMonthIndex(m - 1); setSel(null); }
            }}
            className="flex-1 rounded-lg border p-1.5 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
          <button
            onClick={() => { setYear(now.getFullYear()); setMonthIndex(now.getMonth()); setSel(null); }}
            className="rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700 dark:bg-slate-700 dark:text-violet-300"
          >
            Today
          </button>
        </div>
        <input
          type="search"
          placeholder="Search name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border p-2 text-base dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
        />
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-500" /> Present</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500" /> Absent</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-400" /> Excused</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-600" /> Cutting (!)</span>
        </div>
      </div>

      <div className="m-3 overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
        <table className="border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <th className="sticky left-0 z-10 border-b border-slate-200 bg-slate-100 px-3 py-2 text-left dark:border-slate-700 dark:bg-slate-800">Name</th>
              {days.map((d) => (
                <th key={d} className="border-b border-l border-slate-200 px-1 py-2 text-center font-medium dark:border-slate-700">
                  {Number(d.slice(8))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-800/60 dark:text-slate-100">
                <td className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-100 bg-inherit px-3 py-1 font-medium dark:border-slate-700">
                  {student.name}
                </td>
                {days.map((d) => {
                  const rec = records.find((r) => r.student_id === student.id && r.date === d);
                  const isFuture = d > todayIso;
                  // Future days have no status yet; past/today default to Present.
                  const status: AttStatus | null = rec ? rec.status : isFuture ? null : "present";
                  const meta = status ? STATUS_META[status] : null;
                  return (
                    <td key={d} className="border-b border-l border-slate-100 p-0.5 dark:border-slate-700">
                      <button
                        data-testid={`att-cell-${student.id}-${d}`}
                        onClick={() => { setSel({ studentId: student.id, date: d }); setNote(""); setError(null); }}
                        className={`h-8 w-8 rounded text-[11px] font-bold ${
                          meta ? `text-white ${meta.bg}` : "bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500"
                        }`}
                        title={`${student.name} — ${d}${meta ? " — " + meta.label : ""}`}
                      >
                        {meta ? meta.letter : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && selStudent && (
        <div className="mx-3 mb-3 rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-slate-600 dark:bg-slate-800">
          <div className="mb-2 text-sm font-semibold">
            {selStudent.name} — {sel.date}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => choose(s)}
                className={`rounded-lg p-3 text-sm font-medium text-white ${STATUS_META[s].bg}`}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Reason… (for Excused)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full rounded-lg border p-2 text-base dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
