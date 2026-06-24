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
import { AuthForm, usernameToEmail } from "./AuthForm";

describe("usernameToEmail", () => {
  it("maps a username to a synthetic email, lowercased and trimmed", () => {
    expect(usernameToEmail("  Juan ")).toBe("juan@class.local");
  });
});

describe("AuthForm", () => {
  it("logs in using the username mapped to a synthetic email", async () => {
    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "juan" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({ email: "juan@class.local", password: "secret12" })
    );
  });

  it("on signup stores the plain username in the staff profile row", async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByRole("button", { name: /need an account/i }));
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "Maria" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({ email: "maria@class.local", password: "secret12" })
    );
    expect(insert).toHaveBeenCalledWith({ id: "u1", email: "Maria" });
  });
});
