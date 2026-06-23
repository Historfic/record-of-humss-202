import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Role } from "../lib/roles";

interface AuthState {
  role: Role | null;        // null = not signed in as staff
  guestName: string | null; // set when browsing as a guest
  userId: string | null;
  loading: boolean;
  setGuestName: (name: string) => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRole(uid: string) {
    const { data } = await supabase.from("users").select("role").eq("id", uid).single();
    setRole((data?.role as Role) ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (user) { setUserId(user.id); await loadRole(user.id); }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const user = session?.user;
      setUserId(user?.id ?? null);
      if (user) await loadRole(user.id);
      else setRole(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setRole(null);
    setUserId(null);
  }

  return (
    <Ctx.Provider value={{ role, guestName, userId, loading, setGuestName, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
