import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { isAdmin } from "./lib/roles";
import { AuthForm } from "./components/AuthForm";
import { GuestGate } from "./components/GuestGate";
import { RosterList } from "./components/RosterList";
import { StaffAdmin } from "./components/StaffAdmin";

export default function App() {
  const { role, guestName, loading, setGuestName, signOut } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [tab, setTab] = useState<"roster" | "staff">("roster");

  if (loading) return null;

  // Signed-in staff
  if (role) {
    return (
      <div>
        <header className="flex items-center justify-between border-b p-3">
          <strong>Transparency Report</strong>
          <button className="text-sm text-gray-500" onClick={signOut}>Sign out</button>
        </header>
        {isAdmin(role) && (
          <nav className="flex gap-2 border-b p-2 text-sm">
            <button onClick={() => setTab("roster")}>Roster</button>
            <button onClick={() => setTab("staff")}>Staff</button>
          </nav>
        )}
        {tab === "staff" && isAdmin(role) ? <StaffAdmin /> : <RosterList />}
      </div>
    );
  }

  // Guest viewing
  if (guestName) {
    return (
      <div>
        <header className="border-b p-3"><strong>Transparency Report</strong> — guest: {guestName}</header>
        <RosterList />
      </div>
    );
  }

  // Landing
  if (guestMode) return <GuestGate onEnter={setGuestName} />;
  return (
    <div>
      <AuthForm />
      <div className="mt-4 text-center">
        <button className="text-sm text-green-700 underline" onClick={() => setGuestMode(true)}>
          Continue as guest (view only)
        </button>
      </div>
    </div>
  );
}
