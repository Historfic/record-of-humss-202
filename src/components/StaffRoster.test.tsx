import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { listStaff, setStaffRole, setStaffStatus } = vi.hoisted(() => ({
  listStaff: vi.fn(),
  setStaffRole: vi.fn(),
  setStaffStatus: vi.fn(),
}));
const { resetStaffPassword } = vi.hoisted(() => ({ resetStaffPassword: vi.fn() }));
vi.mock("../lib/staff", () => ({ listStaff, setStaffRole, setStaffStatus }));
vi.mock("../lib/admin", () => ({ resetStaffPassword }));
import { StaffRoster } from "./StaffRoster";

beforeEach(() => {
  listStaff.mockResolvedValue([
    { id: "u1", email: "t@x.com", role: "treasurer", title: "Treasurer", status: "active" },
  ]);
  setStaffRole.mockResolvedValue(undefined);
  setStaffStatus.mockResolvedValue(undefined);
  resetStaffPassword.mockResolvedValue(undefined);
});

describe("StaffRoster", () => {
  it("lists staff", async () => {
    render(<StaffRoster />);
    expect(await screen.findByText("t@x.com")).toBeInTheDocument();
  });

  it("changing role+title and saving calls setStaffRole", async () => {
    render(<StaffRoster />);
    await screen.findByText("t@x.com");
    fireEvent.change(screen.getByLabelText("Role for t@x.com"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Title for t@x.com"), { target: { value: "Boss" } });
    fireEvent.click(screen.getByRole("button", { name: "Save t@x.com" }));
    await waitFor(() => expect(setStaffRole).toHaveBeenCalledWith("u1", "admin", "Boss"));
  });

  it("clicking Revoke calls setStaffStatus(id, revoked)", async () => {
    render(<StaffRoster />);
    await screen.findByText("t@x.com");
    fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
    await waitFor(() => expect(setStaffStatus).toHaveBeenCalledWith("u1", "revoked"));
  });

  it("entering a new password and clicking reset calls resetStaffPassword", async () => {
    render(<StaffRoster />);
    await screen.findByText("t@x.com");
    fireEvent.change(screen.getByLabelText("New password for t@x.com"), { target: { value: "newpw1234" } });
    fireEvent.click(screen.getByRole("button", { name: "Set new password" }));
    await waitFor(() => expect(resetStaffPassword).toHaveBeenCalledWith("u1", "newpw1234"));
  });
});
