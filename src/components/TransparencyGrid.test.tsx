import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const { listStudents, listCollections, listPayments } = vi.hoisted(() => ({
  listStudents: vi.fn().mockResolvedValue([
    { id: "s1", name: "Abad", sort_order: 0 },
    { id: "s2", name: "Cruz", sort_order: 0 },
  ]),
  listCollections: vi.fn().mockResolvedValue([
    { id: "c1", type: "daily", label: "d", amount_centavos: 200, date: "2026-06-01" },
  ]),
  listPayments: vi.fn().mockResolvedValue([
    { id: "p1", student_id: "s1", collection_id: "c1", amount_centavos: 200, paid_at: "" },
  ]),
}));
vi.mock("../lib/students", () => ({ listStudents }));
vi.mock("../lib/funds", async (orig) => {
  const actual = await orig<typeof import("../lib/funds")>();
  return { ...actual, listCollections, listPayments };
});
import { TransparencyGrid } from "./TransparencyGrid";

describe("TransparencyGrid", () => {
  it("renders students and a paid cell as fully paid (green)", async () => {
    render(<TransparencyGrid />);
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    const cell = screen.getByTestId("cell-s1-2026-06-01");
    expect(cell.className).toContain("bg-green");
  });
  it("shows the class total collected", async () => {
    render(<TransparencyGrid />);
    await waitFor(() => expect(screen.getByTestId("class-total")).toHaveTextContent("₱2.00"));
  });
});
