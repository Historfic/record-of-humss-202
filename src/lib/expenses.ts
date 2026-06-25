import { supabase } from "./supabase";
import { write } from "./db";

export interface Expense {
  id: string;
  description: string;
  amount_centavos: number;
  date: string;
  receipt_url: string | null;
}

// Uploads a receipt image to the "receipts" storage bucket and returns its public URL.
// Requires internet (binary uploads are not queued offline).
export async function uploadReceipt(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("receipts").getPublicUrl(path).data.publicUrl;
}

export function balanceCentavos(
  payments: { amount_centavos: number }[],
  expenses: { amount_centavos: number }[]
): number {
  const paid = payments.reduce((s, p) => s + p.amount_centavos, 0);
  const spent = expenses.reduce((s, e) => s + e.amount_centavos, 0);
  return paid - spent;
}

export async function listExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("id,description,amount_centavos,date,receipt_url")
    .eq("deleted", false)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function addExpense(input: {
  description: string;
  amount_centavos: number;
  date: string;
  receipt_url?: string | null;
}): Promise<void> {
  await write({ table: "expenses", kind: "insert", payload: input });
}
