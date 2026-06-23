import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase", () => ({ supabase: {} }));
import { sortStudents, Student } from "./students";

describe("sortStudents", () => {
  it("orders alphabetically by name, case-insensitive", () => {
    const input: Student[] = [
      { id: "1", name: "bautista", sort_order: 0 },
      { id: "2", name: "Abad", sort_order: 0 },
      { id: "3", name: "Cruz", sort_order: 0 },
    ];
    expect(sortStudents(input).map((s) => s.name)).toEqual(["Abad", "bautista", "Cruz"]);
  });
});
