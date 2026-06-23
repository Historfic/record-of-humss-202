import { useState } from "react";
import type { FormEvent } from "react";
import { logGuestVisit } from "../lib/guest";

export function GuestGate({ onEnter }: { onEnter: (name: string) => void }) {
  const [name, setName] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await logGuestVisit(trimmed);
    onEnter(trimmed);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 flex max-w-xs flex-col gap-3 p-4">
      <h1 className="text-xl font-bold">View the Fund Report</h1>
      <label className="flex flex-col text-sm">Your name
        <input className="rounded border p-2" value={name}
          onChange={(e) => setName(e.target.value)} required />
      </label>
      <button className="rounded bg-green-600 p-2 text-white" type="submit">View Report</button>
    </form>
  );
}
