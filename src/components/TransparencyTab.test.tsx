import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("./TransparencyGrid", () => ({ TransparencyGrid: () => <div>TransparencyGrid</div> }));
vi.mock("./Ledger", () => ({ Ledger: () => <div>Ledger</div> }));
vi.mock("./StaffEntry", () => ({ StaffEntry: () => <div>StaffEntry</div> }));

import { TransparencyTab } from "./TransparencyTab";

describe("TransparencyTab", () => {
  it("staff mode shows History sub-tab that swaps to the Ledger", () => {
    render(<TransparencyTab mode="staff" />);
    expect(screen.getByText("TransparencyGrid")).toBeInTheDocument();
    const historyBtn = screen.getByRole("button", { name: "History" });
    fireEvent.click(historyBtn);
    expect(screen.getByText("Ledger")).toBeInTheDocument();
  });

  it("guest mode renders the grid and no History button", () => {
    render(<TransparencyTab mode="guest" />);
    expect(screen.getByText("TransparencyGrid")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "History" })).toBeNull();
  });
});
