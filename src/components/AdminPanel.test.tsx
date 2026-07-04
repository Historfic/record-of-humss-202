import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { listGuestVisits } = vi.hoisted(() => ({ listGuestVisits: vi.fn() }));
const { createStaff } = vi.hoisted(() => ({ createStaff: vi.fn() }));
vi.mock("../lib/guest", () => ({ listGuestVisits }));
vi.mock("../lib/admin", () => ({ createStaff }));
vi.mock("./StaffRoster", () => ({ StaffRoster: () => <div>StaffRoster</div> }));
vi.mock("./Ledger", () => ({ Ledger: () => <div>Ledger</div> }));
vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({
    personalDark: false,
    globalDark: false,
    effective: false,
    togglePersonal: vi.fn(),
    setGlobal: vi.fn(),
  }),
}));
import { AdminPanel } from "./AdminPanel";

beforeEach(() => {
  listGuestVisits.mockResolvedValue([{ id: "g1", name: "Maria", visited_at: "2026-06-01T10:00:00Z" }]);
  createStaff.mockResolvedValue(undefined);
});

describe("AdminPanel", () => {
  it("renders the four sub-tab buttons", () => {
    render(<AdminPanel />);
    expect(screen.getByRole("button", { name: "Staff" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add staff" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Who viewed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "History" })).toBeInTheDocument();
  });

  it("clicking Who viewed lists guest visits", async () => {
    render(<AdminPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Who viewed" }));
    expect(listGuestVisits).toHaveBeenCalled();
    expect(await screen.findByText("Maria")).toBeInTheDocument();
  });

  it("submitting Add staff calls createStaff", async () => {
    render(<AdminPanel />);
    fireEvent.click(screen.getByRole("button", { name: "Add staff" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "n@x.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pw12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(createStaff).toHaveBeenCalled());
  });
});
