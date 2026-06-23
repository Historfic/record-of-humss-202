import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const { getSession, onAuthStateChange, from } = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe() {} } } })),
  from: vi.fn(() => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: "admin", title: "Owner" }, error: null }) }) }),
  })),
}));
vi.mock("../lib/supabase", () => ({
  supabase: { auth: { getSession, onAuthStateChange }, from },
}));

import { AuthProvider, useAuth } from "./AuthContext";

function Probe() {
  const { role, loading } = useAuth();
  return <div>{loading ? "loading" : role}</div>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    getSession.mockResolvedValue({ data: { session: { user: { id: "u1", email: "o@x.com" } } } });
  });
  it("exposes the staff role for a logged-in user", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("admin")).toBeInTheDocument());
  });
});
