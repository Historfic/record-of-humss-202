import { useEffect, useState } from "react";
import { listStudents } from "../lib/students";
import type { Student } from "../lib/students";
import { listPayments } from "../lib/funds";
import type { Payment } from "../lib/funds";
import { balanceCentavos, listExpenses, addExpense, uploadReceipt } from "../lib/expenses";
import type { Expense } from "../lib/expenses";
import { formatPeso, pesosToCentavos } from "../lib/money";

interface Row {
  key: string;
  kind: "in" | "out";
  date: string;
  label: string;
  amount: number;
  receiptUrl?: string | null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function Ledger() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listStudents().then(setStudents);
    listPayments().then(setPayments);
    listExpenses().then(setExpenses);
  }, []);

  const studentName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? "Unknown";

  const totalIn = payments.reduce((s, p) => s + p.amount_centavos, 0);
  const totalOut = expenses.reduce((s, e) => s + e.amount_centavos, 0);
  const balance = balanceCentavos(payments, expenses);

  const rows: Row[] = [
    ...payments.map((p) => ({
      key: "p" + p.id,
      kind: "in" as const,
      date: p.paid_at,
      label: studentName(p.student_id),
      amount: p.amount_centavos,
    })),
    ...expenses.map((e) => ({
      key: "e" + e.id,
      kind: "out" as const,
      date: e.date,
      label: e.description,
      amount: e.amount_centavos,
      receiptUrl: e.receipt_url,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  async function onAddExpense(ev: React.FormEvent) {
    ev.preventDefault();
    if (!description.trim() || !amount) return;
    setBusy(true);
    setError(null);
    try {
      let receipt_url: string | null = null;
      if (receiptFile) receipt_url = await uploadReceipt(receiptFile);
      await addExpense({
        description: description.trim(),
        amount_centavos: pesosToCentavos(Number(amount)),
        date,
        receipt_url,
      });
      setDescription("");
      setAmount("");
      setDate(today());
      setReceiptFile(null);
      setExpenses(await listExpenses());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the expense.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 rounded border p-4">
        <div className="text-sm text-gray-500">Balance</div>
        <div data-testid="balance" className="text-2xl font-bold">
          {formatPeso(balance)}
        </div>
        <div className="mt-1 flex gap-4 text-sm">
          <span className="text-green-600">In {formatPeso(totalIn)}</span>
          <span className="text-red-600">Out {formatPeso(totalOut)}</span>
        </div>
      </div>

      <form onSubmit={onAddExpense} className="mb-4 flex flex-wrap gap-2">
        <input
          className="flex-1 rounded border p-2"
          placeholder="What did you buy?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          data-testid="expense-amount"
          className="w-24 rounded border p-2"
          type="number"
          step="0.01"
          placeholder="₱"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="rounded border p-2"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <label className="flex cursor-pointer items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-700">
          📷 {receiptFile ? receiptFile.name.slice(0, 14) : "Receipt"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          disabled={busy}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          type="submit"
        >
          {busy ? "Saving…" : "Add expense"}
        </button>
      </form>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <table className="w-full border-collapse overflow-hidden rounded-xl text-sm shadow-sm">
        <thead>
          <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Detail</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2 text-center">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-slate-100 odd:bg-white even:bg-slate-50">
              <td className="px-3 py-2 text-slate-500">{r.date.slice(0, 10)}</td>
              <td className="px-3 py-2">
                <span className={r.kind === "in" ? "text-green-600" : "text-red-600"}>
                  {r.kind === "in" ? "+ " : "− "}
                </span>
                {r.label}
              </td>
              <td
                className={
                  "px-3 py-2 text-right font-medium " +
                  (r.kind === "in" ? "text-green-600" : "text-red-600")
                }
              >
                {formatPeso(r.amount)}
              </td>
              <td className="px-3 py-2 text-center">
                {r.receiptUrl ? (
                  <a href={r.receiptUrl} target="_blank" rel="noreferrer">
                    <img
                      src={r.receiptUrl}
                      alt="receipt"
                      className="mx-auto h-10 w-10 rounded object-cover"
                    />
                  </a>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
