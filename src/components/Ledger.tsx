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
  const [mobileTab, setMobileTab] = useState<"in" | "out">("in");
  const [preview, setPreview] = useState<string | null>(null);

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

  const byDateDesc = (a: Row, b: Row) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

  const moneyIn: Row[] = payments
    .map((p) => ({
      key: "p" + p.id,
      kind: "in" as const,
      date: p.paid_at,
      label: studentName(p.student_id),
      amount: p.amount_centavos,
    }))
    .sort(byDateDesc);

  const moneyOut: Row[] = expenses
    .map((e) => ({
      key: "e" + e.id,
      kind: "out" as const,
      date: e.date,
      label: e.description,
      amount: e.amount_centavos,
      receiptUrl: e.receipt_url,
    }))
    .sort(byDateDesc);

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

      {/* Mobile-only In/Out switch so you don't scroll past a long list */}
      <div className="mb-3 flex gap-2 md:hidden">
        <button
          onClick={() => setMobileTab("in")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium ${
            mobileTab === "in" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Money in
        </button>
        <button
          onClick={() => setMobileTab("out")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium ${
            mobileTab === "out" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Money out
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Money IN */}
        <div className={`overflow-hidden rounded-xl border border-slate-200 shadow-sm md:block ${mobileTab === "in" ? "block" : "hidden"}`}>
          <div className="bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            💰 Money in — {formatPeso(totalIn)}
          </div>
          <ul className="divide-y divide-slate-100">
            {moneyIn.length === 0 && <li className="px-3 py-3 text-sm text-slate-400">No payments yet.</li>}
            {moneyIn.map((r) => (
              <li key={r.key} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>
                  <span className="text-slate-400">{r.date.slice(0, 10)} · </span>
                  {r.label}
                </span>
                <span className="font-medium text-green-600">+{formatPeso(r.amount)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Money OUT */}
        <div className={`overflow-hidden rounded-xl border border-slate-200 shadow-sm md:block ${mobileTab === "out" ? "block" : "hidden"}`}>
          <div className="bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            🧾 Money out — {formatPeso(totalOut)}
          </div>
          <ul className="divide-y divide-slate-100">
            {moneyOut.length === 0 && <li className="px-3 py-3 text-sm text-slate-400">No expenses yet.</li>}
            {moneyOut.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="text-slate-400">{r.date.slice(0, 10)} · </span>
                  {r.label}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {r.receiptUrl && (
                    <button onClick={() => setPreview(r.receiptUrl ?? null)} title="View receipt">
                      <img src={r.receiptUrl} alt="receipt" className="h-8 w-8 rounded object-cover" />
                    </button>
                  )}
                  <span className="font-medium text-red-600">−{formatPeso(r.amount)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            alt="receipt"
            className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            aria-label="Close preview"
            onClick={() => setPreview(null)}
            className="fixed right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-lg font-bold text-slate-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
