import { describe, it, expect, vi } from "vitest";
vi.mock("./supabase", () => ({ supabase: {} }));
import { statusFor, AttendanceRecord } from "./attendance";

describe("statusFor", () => {
  const records: AttendanceRecord[] = [
    { id: "1", student_id: "s1", date: "2026-06-24", status: "absent", note: null },
    { id: "2", student_id: "s2", date: "2026-06-24", status: "excused", note: "sick" },
  ];
  it("returns the stored status for a student with a record", () => {
    expect(statusFor(records, "s1")).toBe("absent");
    expect(statusFor(records, "s2")).toBe("excused");
  });
  it("defaults to 'present' when no record exists", () => {
    expect(statusFor(records, "s3")).toBe("present");
  });
});
