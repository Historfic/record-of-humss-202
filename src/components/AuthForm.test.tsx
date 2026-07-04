import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { signInWithPassword, signUp, insert } = vi.hoisted(() => ({
  signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
  signUp: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
  insert: vi.fn().mockResolvedValue({ error: null }),
}));
vi.mock("../lib/supabase", () => ({
  supabase: { auth: { signInWithPassword, signUp }, from: () => ({ insert }) },
}));
import { AuthForm } from "./AuthForm";

describe("AuthForm", () => {
  it("signs in with entered credentials", async () => {
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "o@x.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({ email: "o@x.com", password: "secret12" })
    );
  });

  it("on signup stores the staff profile row", async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByRole("button", { name: /need an account/i }));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "maria@x.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({ email: "maria@x.com", password: "secret12" })
    );
    expect(insert).toHaveBeenCalledWith({ id: "u1", email: "maria@x.com", status: "pending" });
  });
});
