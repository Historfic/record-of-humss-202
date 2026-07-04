import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getGlobalDark, setGlobalDark } from "../lib/settings";

interface ThemeState {
  personalDark: boolean;
  globalDark: boolean;
  effective: boolean;
  togglePersonal: () => void;
  setGlobal: (on: boolean) => Promise<void>;
}

const Ctx = createContext<ThemeState | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [personalDark, setPersonalDark] = useState<boolean>(
    () => typeof localStorage !== "undefined" && localStorage.getItem("theme-dark") === "1",
  );
  const [globalDark, setGlobalDarkState] = useState<boolean>(false);

  useEffect(() => {
    getGlobalDark().then(setGlobalDarkState).catch(() => {});
  }, []);

  const effective = globalDark || personalDark;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", effective);
  }, [effective]);

  function togglePersonal() {
    setPersonalDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("theme-dark", next ? "1" : "0");
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }

  async function setGlobal(on: boolean) {
    await setGlobalDark(on);
    setGlobalDarkState(on);
  }

  return (
    <Ctx.Provider value={{ personalDark, globalDark, effective, togglePersonal, setGlobal }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme(): ThemeState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
}
