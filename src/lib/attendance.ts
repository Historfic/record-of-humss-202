import { supabase } from "./supabase";

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
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("student_id", studentId)
      .eq("date", date);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("attendance")
    .upsert(
      { student_id: studentId, date, status, note },
      { onConflict: "student_id,date" }
    );
  if (error) throw error;
}
