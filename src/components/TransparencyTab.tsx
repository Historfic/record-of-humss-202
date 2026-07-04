import { useState } from "react";
import { TransparencyGrid } from "./TransparencyGrid";
import { Ledger } from "./Ledger";
import { StaffEntry } from "./StaffEntry";

type SubTab = "Grid" | "History" | "Record";

interface TransparencyTabProps {
  mode: "staff" | "guest";
}

export function TransparencyTab({ mode }: TransparencyTabProps) {
  const [sub, setSub] = useState<SubTab>("Grid");

  // Guests get a read-only grid with no sub-tab bar.
  if (mode === "guest") {
    return <TransparencyGrid />;
  }

  const tabs: SubTab[] = ["Grid", "History", "Record"];

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-4 pb-0">
        {tabs.map((t) => {
          const active = sub === t;
          return (
            <button
              key={t}
              onClick={() => setSub(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md"
                  : "bg-white text-slate-600 shadow-sm hover:bg-violet-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div>
        {sub === "Grid" && <TransparencyGrid canEdit />}
        {sub === "History" && <Ledger />}
        {sub === "Record" && <StaffEntry />}
      </div>
    </div>
  );
}
