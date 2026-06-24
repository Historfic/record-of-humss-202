import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { listStudents, listPayments, listExpenses, addExpense } = vi.hoisted(() => ({
  listStudents: vi.fn().mockResolvedValue([{ id: "s1", name: "Abad", sort_order: 0 }]),
  listPayments: vi.fn().mockResolvedValue([
    { id: "p1", student_id: "s1", collection_id: "c1", amount_centavos: 1000, paid_at: "2026-06-02T10:00:00Z" },
  ]),
  listExpenses: vi.fn().mockResolvedValue([
    { id: "e1", description: "Bond paper", amount_centavos: 300, date: "2026-06-01" },
  ]),
  addExpense: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/students", () => ({ listStudents }));
vi.mock("../lib/funds", async (orig) => {
  const actual = await orig<typeof import("../lib/funds")>();
  return { ...actual, listPayments };
});
vi.mock("../lib/expenses", async (orig) => {
  const actual = await orig<typeof import("../lib/expenses")>();
  return { ...actual, listExpenses, addExpense };
});
import { Ledger } from "./Ledger";

describe("Ledger", () => {
  it("shows the running balance (1000 in - 300 out = ₱7.00)", async () => {
    render(<Ledger />);
    await waitFor(() => expect(screen.getByTestId("balance")).toHaveTextContent("₱7.00"));
  });
  it("lists money in with the student name and money out with description", async () => {
    render(<Ledger />);
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    expect(screen.getByText(/Bond paper/)).toBeInTheDocument();
  });
  it("adds an expense", async () => {
    render(<Ledger />);
    await waitFor(() => expect(screen.getByTestId("balance")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/what did you buy/i), { target: { value: "Markers" } });
    fireEvent.change(screen.getByTestId("expense-amount"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /add expense/i }));
    await waitFor(() =>
      expect(addExpense).toHaveBeenCalledWith(expect.objectContaining({ description: "Markers", amount_centavos: 500 }))
    );
  });
});
