import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("./context/AuthContext", () => ({ useAuth }));
vi.mock("./components/AuthForm", () => ({ AuthForm: () => <div>AuthForm</div> }));
vi.mock("./components/GuestGate", () => ({ GuestGate: () => <div>GuestGate</div> }));
vi.mock("./components/AttendanceTab", () => ({ AttendanceTab: () => <div>AttendanceTab</div> }));
vi.mock("./components/TransparencyTab", () => ({ TransparencyTab: ({ mode }: { mode: string }) => <div>TransparencyTab:{mode}</div> }));
vi.mock("./components/CalendarTab", () => ({ CalendarTab: () => <div>CalendarTab</div> }));
vi.mock("./components/AdminPanel", () => ({ AdminPanel: () => <div>AdminPanel</div> }));
vi.mock("./components/Calculator", () => ({ Calculator: ({ open }: { open: boolean }) => (open ? <div>Calculator</div> : null) }));
vi.mock("./components/OfflineBanner", () => ({ OfflineBanner: () => null }));
vi.mock("./lib/db", () => ({ flushOutbox: vi.fn().mockResolvedValue(0) }));
import App from "./App";

describe("App routing", () => {
  it("staff sees Attendance by default and can switch to Transparency", () => {
    useAuth.mockReturnValue({ role: "treasurer", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.getByText("AttendanceTab")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Attendance" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Transparency" }));
    expect(screen.getByText("TransparencyTab:staff")).toBeInTheDocument();
  });
  it("non-admin staff does NOT see the Admin nav item", () => {
    useAuth.mockReturnValue({ role: "treasurer", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.queryByRole("button", { name: "Admin" })).toBeNull();
  });
  it("admin sees the Admin nav item", () => {
    useAuth.mockReturnValue({ role: "admin", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.getByRole("button", { name: "Admin" })).toBeInTheDocument();
  });
  it("guest sees the transparency tab and not attendance", () => {
    useAuth.mockReturnValue({ role: null, guestName: "Juan", loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    expect(screen.getByText("TransparencyTab:guest")).toBeInTheDocument();
    expect(screen.queryByText("AttendanceTab")).toBeNull();
  });
  it("opens the calculator from the floating button", () => {
    useAuth.mockReturnValue({ role: "auditor", guestName: null, loading: false, setGuestName: vi.fn(), signOut: vi.fn() });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /calculator/i }));
    expect(screen.getByText("Calculator")).toBeInTheDocument();
  });
});
