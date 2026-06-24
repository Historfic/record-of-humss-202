import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { OfflineBanner } from "./components/OfflineBanner";
import { flushOutbox } from "./lib/db";
import { isAdmin } from "./lib/roles";
import type { Role } from "./lib/roles";
import { AuthForm } from "./components/AuthForm";
import { GuestGate } from "./components/GuestGate";
import { AttendanceTab } from "./components/AttendanceTab";
import { TransparencyTab } from "./components/TransparencyTab";
import { CalendarTab } from "./components/CalendarTab";
import { AdminPanel } from "./components/AdminPanel";
import { Calculator } from "./components/Calculator";

type View = "Attendance" | "Transparency" | "Calendar" | "Admin";

const APP_NAME = "Records of HUMSS-202";

function CalculatorButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      aria-label="Calculator"
      onClick={onOpen}
      className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-2xl text-white shadow-lg transition hover:scale-105 active:scale-95"
    >
      🧮
    </button>
  );
}

function NavItem({
  label,
  emoji,
  active,
  primary,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-2xl text-left transition",
        primary ? "px-4 py-3 text-base font-semibold" : "px-4 py-2 text-sm font-medium",
        active
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md"
          : "text-slate-600 hover:bg-violet-100/70",
      ].join(" ")}
    >
      <span aria-hidden="true" className="text-xl leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

export default function App() {
  const { role, guestName, loading, setGuestName, signOut } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [view, setView] = useState<View>("Attendance");
  const [calcOpen, setCalcOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    void flushOutbox().catch(() => {});
  }, []);

  if (loading) return null;

  // ---------- Signed-in staff ----------
  if (role) {
    const admin = isAdmin(role as Role);
    const go = (v: View) => {
      setView(v);
      setDrawerOpen(false);
    };

    const sidebar = (
      <div className="flex h-full flex-col gap-6 p-4">
        <div className="px-2">
          <div className="text-lg font-bold leading-tight text-violet-700">{APP_NAME}</div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem label="Attendance" emoji="📋" primary active={view === "Attendance"} onClick={() => go("Attendance")} />
          <NavItem label="Transparency" emoji="💰" primary active={view === "Transparency"} onClick={() => go("Transparency")} />
        </nav>

        <div className="mt-2">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Staff tools
          </div>
          <nav className="flex flex-col gap-1 border-t border-violet-100 pt-3">
            <NavItem label="Calendar" emoji="🗓️" active={view === "Calendar"} onClick={() => go("Calendar")} />
            {admin && (
              <NavItem label="Admin" emoji="👑" active={view === "Admin"} onClick={() => go("Admin")} />
            )}
          </nav>
        </div>

        <button
          onClick={signOut}
          className="mt-auto rounded-2xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          Sign out
        </button>
      </div>
    );

    return (
      <div className="min-h-screen sm:flex">
        {/* Desktop fixed sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-violet-100 bg-white/70 backdrop-blur sm:block sm:fixed sm:inset-y-0 sm:left-0">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-900/30 sm:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl sm:hidden">
              {sidebar}
            </aside>
          </>
        )}

        <div className="flex-1 sm:ml-56">
          {/* Slim top bar */}
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-violet-100 bg-white/70 px-3 py-2 backdrop-blur sm:px-6">
            <button
              aria-label="Open menu"
              className="rounded-xl p-2 text-xl text-violet-700 hover:bg-violet-100 sm:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              ☰
            </button>
            <strong className="text-violet-700">{APP_NAME}</strong>
          </header>

          <OfflineBanner />

          <main className="mx-auto max-w-5xl pb-24">
            {view === "Attendance" && <AttendanceTab />}
            {view === "Transparency" && <TransparencyTab mode="staff" />}
            {view === "Calendar" && <CalendarTab />}
            {view === "Admin" && <AdminPanel />}
          </main>
        </div>

        <CalculatorButton onOpen={() => setCalcOpen(true)} />
        <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
      </div>
    );
  }

  // ---------- Guest viewing ----------
  if (guestName) {
    return (
      <div className="min-h-screen pb-24">
        <OfflineBanner />
        <header className="sticky top-0 z-20 border-b border-violet-100 bg-white/70 px-4 py-3 backdrop-blur">
          <strong className="text-violet-700">{APP_NAME}</strong>
          <span className="text-slate-500"> — guest: {guestName}</span>
        </header>
        <main className="mx-auto max-w-5xl">
          <TransparencyTab mode="guest" />
        </main>
        <CalculatorButton onOpen={() => setCalcOpen(true)} />
        <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
      </div>
    );
  }

  // ---------- Landing ----------
  if (guestMode) return <GuestGate onEnter={setGuestName} />;
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur">
        <h1 className="mb-1 text-center text-2xl font-bold text-violet-700">{APP_NAME}</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Welcome back 👋</p>
        <AuthForm />
        <div className="mt-6 text-center">
          <button
            className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline"
            onClick={() => setGuestMode(true)}
          >
            Continue as guest (view only)
          </button>
        </div>
      </div>
    </div>
  );
}
