import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { listStudents, listAttendanceBetween, setAttendance } = vi.hoisted(() => ({
  listStudents: vi.fn().mockResolvedValue([
    { id: "s1", name: "Abad", sort_order: 0 },
    { id: "s2", name: "Cruz", sort_order: 0 },
  ]),
  listAttendanceBetween: vi.fn().mockResolvedValue([]),
  setAttendance: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/students", () => ({ listStudents }));
vi.mock("../lib/attendance", async (orig) => {
  const actual = await orig<typeof import("../lib/attendance")>();
  return { ...actual, listAttendanceBetween, setAttendance };
});
import { AttendanceTab } from "./AttendanceTab";

describe("AttendanceTab (month grid)", () => {
  it("marks a student absent on a specific date", async () => {
    render(<AttendanceTab initialYear={2026} initialMonth={5} />); // June 2026
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("att-cell-s1-2026-06-01"));
    fireEvent.click(screen.getByRole("button", { name: /absent/i }));
    await waitFor(() =>
      expect(setAttendance).toHaveBeenCalledWith("s1", "2026-06-01", "absent", null)
    );
  });

  it("filters the roster by search", async () => {
    render(<AttendanceTab initialYear={2026} initialMonth={5} />);
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: "cruz" } });
    expect(screen.queryByText("Abad")).toBeNull();
    expect(screen.getByText("Cruz")).toBeInTheDocument();
  });

  it("shows the month label and can move to the next month", async () => {
    render(<AttendanceTab initialYear={2026} initialMonth={5} />);
    expect(screen.getByTestId("att-month")).toHaveTextContent("June 2026");
    fireEvent.click(screen.getByRole("button", { name: "›" }));
    expect(screen.getByTestId("att-month")).toHaveTextContent("July 2026");
  });
});
