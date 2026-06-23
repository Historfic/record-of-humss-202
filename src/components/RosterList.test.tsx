import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const { listStudents } = vi.hoisted(() => ({
  listStudents: vi.fn().mockResolvedValue([
    { id: "1", name: "Abad", sort_order: 0 },
    { id: "2", name: "Cruz", sort_order: 0 },
  ]),
}));
vi.mock("../lib/students", () => ({ listStudents }));
import { RosterList } from "./RosterList";

describe("RosterList", () => {
  it("renders students alphabetically", async () => {
    render(<RosterList />);
    await waitFor(() => expect(screen.getByText("Abad")).toBeInTheDocument());
    expect(screen.getByText("Cruz")).toBeInTheDocument();
  });
});
