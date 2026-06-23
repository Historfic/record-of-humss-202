import { supabase } from "./supabase";

export interface Student {
  id: string;
  name: string;
  sort_order: number;
}

export function sortStudents(students: Student[]): Student[] {
  return [...students].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id,name,sort_order")
    .eq("deleted", false);
  if (error) throw error;
  return sortStudents((data ?? []) as Student[]);
}

export async function addStudent(name: string): Promise<void> {
  const { error } = await supabase.from("students").insert({ name });
  if (error) throw error;
}
