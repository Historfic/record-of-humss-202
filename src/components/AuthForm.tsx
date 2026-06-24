import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";

// Supabase auth needs an email-shaped identifier, but classmates only type a
// username. We map a username to a synthetic email behind the scenes so no real
// email is ever required. The plain username is what we store + show to the admin.
const USERNAME_DOMAIN = "class.local";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
}

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const name = username.trim();
    if (!name) return;
    const email = usernameToEmail(name);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); return; }
      if (data.user) {
        // create the staff profile row (defaults to auditor; admin assigns real role).
        // store the plain username so the admin sees a friendly name, not the synthetic email.
        await supabase.from("users").insert({ id: data.user.id, email: name });
      }
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 flex max-w-xs flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">{mode === "login" ? "Staff Log In" : "Staff Sign Up"}</h1>
      <label className="flex flex-col text-sm">Username
        <input className="rounded border p-2" type="text" autoCapitalize="none"
          autoCorrect="off" value={username}
          onChange={(e) => setUsername(e.target.value)} required />
      </label>
      <label className="flex flex-col text-sm">Password
        <input className="rounded border p-2" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="rounded bg-green-600 p-2 text-white" type="submit">
        {mode === "login" ? "Log In" : "Sign Up"}
      </button>
      <button type="button" className="text-sm text-gray-500"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
      </button>
    </form>
  );
}
