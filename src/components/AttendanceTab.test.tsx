import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { listStudents, listAttendance, setAttendance } = vi.hoisted(() => ({
  listStudents: vi.fn().mockResolvedValue([
    { id: "s1", name: "Abad", sort_order: 0 },
    { id: "s2", name: "Cruz", sort_order: 0 },
  ]),
  listAttendance: vi.fn().mockResolvedValue([]),
  setAttendance: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/students", () => ({ listStudents }));
vi.mock("../lib/attendance", async (orig) => {
  const actual = await orig<typeof import("../lib/attendance")>();
  return { ...actual, listAttendance, setAttendance };
});
import { AttendanceTab } from "./AttendanceTab";

describe("AttendanceTab", () => {
  it("marks a student absent", async () => {
    render(<AttendanceTab />);
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Abad"));
    fireEvent.click(screen.getByRole("button", { name: /absent/i }));
    await waitFor(() =>
      expect(setAttendance).toHaveBeenCalledWith("s1", expect.any(String), "absent", null)
    );
  });

  it("filters the roster by search", async () => {
    render(<AttendanceTab />);
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: "cruz" } });
    expect(screen.queryByText("Abad")).toBeNull();
    expect(screen.getByText("Cruz")).toBeInTheDocument();
  });
});
