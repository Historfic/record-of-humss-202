import { describe, it, expect } from "vitest";
import { weekdaysOfMonth, monthLabel, shiftMonth } from "./dates";

describe("weekdaysOfMonth", () => {
  it("lists Mon-Fri dates and excludes weekends", () => {
    const days = weekdaysOfMonth(2026, 5); // June 2026 (June 1 is a Monday)
    expect(days[0]).toBe("2026-06-01");
    expect(days).not.toContain("2026-06-06"); // Saturday
    expect(days).not.toContain("2026-06-07"); // Sunday
    expect(days).toContain("2026-06-30");
  });
});

describe("monthLabel", () => {
  it("names the month and year", () => {
    expect(monthLabel(2026, 5)).toBe("June 2026");
  });
});

describe("shiftMonth", () => {
  it("moves forward and rolls the year", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, monthIndex: 0 });
  });
  it("moves backward and rolls the year", () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, monthIndex: 11 });
  });
});
