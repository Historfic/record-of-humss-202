import { describe, it, expect, vi } from "vitest";
vi.mock("./supabase", () => ({ supabase: {} }));
import { sortByDueDate, CalendarNote } from "./calendar";

describe("sortByDueDate", () => {
  it("orders notes by due_date ascending, undated last", () => {
    const notes: CalendarNote[] = [
      { id: "1", title: "B", description: null, due_date: "2026-07-10" },
      { id: "2", title: "A", description: null, due_date: "2026-06-20" },
      { id: "3", title: "C", description: null, due_date: null },
    ];
    expect(sortByDueDate(notes).map((n) => n.title)).toEqual(["A", "B", "C"]);
  });
});
