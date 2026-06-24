import { supabase } from "./supabase";
import { write } from "./db";

export interface CalendarNote {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
}

export function sortByDueDate(notes: CalendarNote[]): CalendarNote[] {
  return [...notes].sort((a, b) => {
    if (a.due_date === b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

export async function listNotes(): Promise<CalendarNote[]> {
  const { data, error } = await supabase
    .from("calendar_notes")
    .select("id,title,description,due_date")
    .eq("deleted", false);
  if (error) throw error;
  return sortByDueDate((data ?? []) as CalendarNote[]);
}

export async function addNote(input: { title: string; description: string | null; due_date: string | null }): Promise<void> {
  await write({ table: "calendar_notes", kind: "insert", payload: input });
}

export async function deleteNote(id: string): Promise<void> {
  await write({ table: "calendar_notes", kind: "update", payload: { deleted: true }, match: { id } });
}
