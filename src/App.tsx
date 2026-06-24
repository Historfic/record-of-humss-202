import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { OfflineBanner } from "./components/OfflineBanner";
import { flushOutbox } from "./lib/db";
import { isAdmin } from "./lib/roles";
import type { Role } from "./lib/roles";
import { AuthForm } from "./components/AuthForm";
import { GuestGate } from "./components/GuestGate";
import { AttendanceTab } from "./components/AttendanceTab";
import { TransparencyGrid } from "./components/TransparencyGrid";
import { Ledger } from "./components/Ledger";
import { StaffEntry } from "./components/StaffEntry";
import { CalendarTab } from "./components/CalendarTab";
import { StaffAdmin } from "./components/StaffAdmin";
import { Calculator } from "./components/Calculator";

type Tab = "Attendance" | "Transparency" | "Ledger" | "Entry" | "Calendar" | "Staff";

function CalculatorButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      aria-label="Calculator"
      onClick={onOpen}
      className="fixed bottom-20 right-4 z-10 rounded-full bg-green-600 text-white w-14 h-14 shadow-lg"
    >
      🧮
    </button>
  );
}

export default function App() {
  const { role, guestName, loading, setGuestName, signOut } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [tab, setTab] = useState<Tab>("Attendance");
  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    void flushOutbox().catch(() => {});
  }, []);

  if (loading) return null;

  // Signed-in staff
  if (role) {
    const tabs: { key: Tab; node: React.ReactNode }[] = [
      { key: "Attendance", node: <AttendanceTab /> },
      { key: "Transparency", node: <TransparencyGrid /> },
      { key: "Ledger", node: <Ledger /> },
      { key: "Entry", node: <StaffEntry /> },
      { key: "Calendar", node: <CalendarTab /> },
    ];
    if (isAdmin(role as Role)) {
      tabs.push({ key: "Staff", node: <StaffAdmin /> });
    }
    const active = tabs.find((t) => t.key === tab) ?? tabs[0];

    return (
      <div className="pb-16">
        <OfflineBanner />
        <header className="flex items-center justify-between border-b p-3">
          <strong>Transparency Report</strong>
          <button className="text-sm text-gray-500" onClick={signOut}>
            Sign out
          </button>
        </header>
        <main>{active.node}</main>
        <nav className="fixed bottom-0 inset-x-0 border-t bg-white flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs ${
                active.key === t.key ? "text-green-600 font-semibold" : ""
              }`}
            >
              {t.key}
            </button>
          ))}
        </nav>
        <CalculatorButton onOpen={() => setCalcOpen(true)} />
        <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
      </div>
    );
  }

  // Guest viewing
  if (guestName) {
    return (
      <div>
        <OfflineBanner />
        <header className="border-b p-3">
          <strong>Transparency Report</strong> — guest: {guestName}
        </header>
        <TransparencyGrid />
        <CalculatorButton onOpen={() => setCalcOpen(true)} />
        <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
      </div>
    );
  }

  // Landing
  if (guestMode) return <GuestGate onEnter={setGuestName} />;
  return (
    <div>
      <AuthForm />
      <div className="mt-4 text-center">
        <button
          className="text-sm text-green-700 underline"
          onClick={() => setGuestMode(true)}
        >
          Continue as guest (view only)
        </button>
      </div>
    </div>
  );
}
