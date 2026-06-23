import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { listStaff, setStaffRole, setStaffStatus } = vi.hoisted(() => ({
  listStaff: vi.fn().mockResolvedValue([
    { id: "u2", email: "t@x.com", role: "auditor", title: null, status: "active" },
  ]),
  setStaffRole: vi.fn().mockResolvedValue(undefined),
  setStaffStatus: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/staff", () => ({ listStaff, setStaffRole, setStaffStatus }));
import { StaffAdmin } from "./StaffAdmin";

describe("StaffAdmin", () => {
  it("assigns a new role and title to a staff member", async () => {
    render(<StaffAdmin />);
    await waitFor(() => expect(screen.getByText("t@x.com")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/role for t@x.com/i), { target: { value: "treasurer" } });
    fireEvent.change(screen.getByLabelText(/title for t@x.com/i), { target: { value: "Treasurer" } });
    fireEvent.click(screen.getByRole("button", { name: /save t@x.com/i }));
    await waitFor(() =>
      expect(setStaffRole).toHaveBeenCalledWith("u2", "treasurer", "Treasurer")
    );
  });
});
