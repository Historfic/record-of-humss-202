import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { listStudents, addStudent, listCollections, addCollection, recordPayment } = vi.hoisted(() => ({
  listStudents: vi.fn().mockResolvedValue([{ id: "s1", name: "Abad", sort_order: 0 }]),
  addStudent: vi.fn().mockResolvedValue(undefined),
  listCollections: vi.fn().mockResolvedValue([
    { id: "c1", type: "daily", label: "Mon", amount_centavos: 200, date: "2026-06-01" },
  ]),
  addCollection: vi.fn().mockResolvedValue(undefined),
  recordPayment: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/students", () => ({ listStudents, addStudent }));
vi.mock("../lib/funds", async (orig) => {
  const actual = await orig<typeof import("../lib/funds")>();
  return { ...actual, listCollections, addCollection, recordPayment };
});
import { StaffEntry } from "./StaffEntry";

describe("StaffEntry", () => {
  it("adds a student", async () => {
    render(<StaffEntry />);
    fireEvent.change(screen.getByPlaceholderText(/new student name/i), { target: { value: "Bautista" } });
    fireEvent.click(screen.getByRole("button", { name: /add student/i }));
    await waitFor(() => expect(addStudent).toHaveBeenCalledWith("Bautista"));
  });

  it("records a payment in centavos", async () => {
    render(<StaffEntry />);
    await waitFor(() => expect(screen.getByRole("option", { name: "Abad" })).toBeInTheDocument());
    fireEvent.change(screen.getByTestId("pay-amount"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /record payment/i }));
    await waitFor(() =>
      expect(recordPayment).toHaveBeenCalledWith({ student_id: "s1", collection_id: "c1", amount_centavos: 200 })
    );
  });
});
