import { supabase } from "./supabase";

export interface Collection {
  id: string;
  type: "daily" | "weekly" | "special";
  label: string;
  amount_centavos: number;
  date: string; // ISO date
}

export interface Payment {
  id: string;
  student_id: string;
  collection_id: string;
  amount_centavos: number;
  paid_at: string;
}

export function totalCentavos(items: { amount_centavos: number }[]): number {
  return items.reduce((sum, i) => sum + i.amount_centavos, 0);
}

export async function listCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("id,type,label,amount_centavos,date")
    .eq("deleted", false)
    .order("date");
  if (error) throw error;
  return (data ?? []) as Collection[];
}

export async function listPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("id,student_id,collection_id,amount_centavos,paid_at")
    .eq("deleted", false);
  if (error) throw error;
  return (data ?? []) as Payment[];
}

export async function addCollection(input: {
  type: Collection["type"];
  label: string;
  amount_centavos: number;
  date: string;
}): Promise<void> {
  const { error } = await supabase.from("collections").insert(input);
  if (error) throw error;
}

export async function recordPayment(input: {
  student_id: string;
  collection_id: string;
  amount_centavos: number;
}): Promise<void> {
  const { error } = await supabase.from("payments").insert(input);
  if (error) throw error;
}
