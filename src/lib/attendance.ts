import { supabase } from "./supabase";
import { write } from "./db";

export type AttStatus = "present" | "absent" | "excused" | "cutting";

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string; // ISO date e.g. "2026-06-24"
  status: AttStatus;
  note: string | null;
}

export function statusFor(records: AttendanceRecord[], studentId: string): AttStatus {
  const rec = records.find((r) => r.student_id === studentId);
  return rec ? rec.status : "present";
}

// Status of a student on a specific date (defaults to present when no record).
export function statusForDate(
  records: AttendanceRecord[],
  studentId: string,
  date: string
): AttStatus {
  const rec = records.find((r) => r.student_id === studentId && r.date === date);
  return rec ? rec.status : "present";
}

// All attendance records within an inclusive date range (for the month grid).
export async function listAttendanceBetween(
  start: string,
  end: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("id,student_id,date,status,note")
    .gte("date", start)
    .lte("date", end);
  if (error) throw error;
  return (data ?? []) as AttendanceRecord[];
}

export async function listAttendance(date: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("id,student_id,date,status,note")
    .eq("date", date);
  if (error) throw error;
  return (data ?? []) as AttendanceRecord[];
}

// Upsert a student's status for a date. Setting status 'present' removes any
// exception row (present is the default, so we don't store it).
export async function setAttendance(
  studentId: string,
  date: string,
  status: AttStatus,
  note: string | null = null
): Promise<void> {
  if (status === "present") {
    await write({ table: "attendance", kind: "delete", match: { student_id: studentId, date } });
    return;
  }
  await write({
    table: "attendance",
    kind: "upsert",
    payload: { student_id: studentId, date, status, note },
    onConflict: "student_id,date",
  });
}
