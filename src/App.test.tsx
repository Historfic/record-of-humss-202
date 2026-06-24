import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("./context/AuthContext", () => ({ useAuth }));
vi.mock("./components/AuthForm", () => ({ AuthForm: () => <div>AuthForm</div> }));
vi.mock("./components/GuestGate", () => ({ GuestGate: () => <div>GuestGate</div> }));
vi.mock("./components/AttendanceTab", () => ({ AttendanceTab: () => <div>AttendanceTab</div> }));
vi.mock("./components/TransparencyGrid", () => ({ TransparencyGrid: () => <div>TransparencyGrid</div> }));
vi.mock("./components/Ledger", () => ({ Ledger: () => <div>Ledger</div> }));
vi.mock("./components/StaffEntry", () => ({ StaffEntry: () => <div>StaffEntry</div> }));
vi.mock("./components/CalendarTab", () => ({ CalendarTab: () => <div>CalendarTab</div> }));
vi.mock("./components/StaffAdmin", () => ({ StaffAdmin: () => <div>StaffAdmin</div> }));
vi.mock("./components/Calculator", () => ({ Calculator: ({ open }: { open: boolean }) => (open ? <div>Calculator</div> : null) }));
import App from "./App";

describe("App routing", () => {
  it("staff sees Attendance by default and can switch to Transparency", () => {
    useAuth.mockReturnValue({ role: "treasurer", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.getByText("AttendanceTab")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Transparency" }));
    expect(screen.getByText("TransparencyGrid")).toBeInTheDocument();
  });
  it("non-admin staff does NOT see the Staff tab", () => {
    useAuth.mockReturnValue({ role: "treasurer", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.queryByRole("button", { name: "Staff" })).toBeNull();
  });
  it("admin sees the Staff tab", () => {
    useAuth.mockReturnValue({ role: "admin", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.getByRole("button", { name: "Staff" })).toBeInTheDocument();
  });
  it("guest sees only the transparency grid", () => {
    useAuth.mockReturnValue({ role: null, guestName: "Juan", loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.getByText("TransparencyGrid")).toBeInTheDocument();
    expect(screen.queryByText("AttendanceTab")).toBeNull();
  });
  it("opens the calculator from the floating button", () => {
    useAuth.mockReturnValue({ role: "auditor", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /calculator/i }));
    expect(screen.getByText("Calculator")).toBeInTheDocument();
  });
});
