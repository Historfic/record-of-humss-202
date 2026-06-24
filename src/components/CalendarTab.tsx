import { useEffect, useState } from "react";
import { listNotes, addNote, deleteNote } from "../lib/calendar";
import type { CalendarNote } from "../lib/calendar";

export function CalendarTab() {
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function refresh() {
    setNotes(await listNotes());
  }

  useEffect(() => {
    let active = true;
    listNotes().then((n) => {
      if (active) setNotes(n);
    });
    return () => {
      active = false;
    };
  }, []);

  async function submit() {
    if (!title.trim()) return;
    await addNote({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    await refresh();
  }

  async function remove(id: string) {
    await deleteNote(id);
    await refresh();
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-col gap-2 bg-white p-3 shadow">
        <input
          type="text"
          placeholder="Project / assignment…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border p-2 text-base"
        />
        <input
          type="text"
          placeholder="Description (optional)…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded border p-2 text-base"
        />
        <input
          type="date"
          data-testid="note-due"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded border p-2 text-base"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded bg-blue-600 p-3 text-base font-medium text-white"
        >
          Add
        </button>
      </div>

      <ul className="flex flex-col divide-y">
        {notes.map((note) => (
          <li key={note.id} className="flex items-start gap-3 p-4">
            <div className="flex flex-1 flex-col">
              <span className="text-lg">{note.title}</span>
              {note.description && (
                <span className="text-sm text-gray-600">{note.description}</span>
              )}
              <span className="text-sm text-gray-500">
                {note.due_date ? note.due_date : "No due date"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => remove(note.id)}
              className="rounded bg-gray-100 px-3 py-1 text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
