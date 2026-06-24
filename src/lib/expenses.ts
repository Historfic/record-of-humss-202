import { supabase } from "./supabase";
import { write } from "./db";

export interface Expense {
  id: string;
  description: string;
  amount_centavos: number;
  date: string;
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
    .select("id,description,amount_centavos,date")
    .eq("deleted", false)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function addExpense(input: { description: string; amount_centavos: number; date: string }): Promise<void> {
  await write({ table: "expenses", kind: "insert", payload: input });
}
