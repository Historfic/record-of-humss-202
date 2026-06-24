import { useEffect, useState } from "react";
import { listStudents } from "../lib/students";
import type { Student } from "../lib/students";
import { listPayments } from "../lib/funds";
import type { Payment } from "../lib/funds";
import { balanceCentavos, listExpenses, addExpense } from "../lib/expenses";
import type { Expense } from "../lib/expenses";
import { formatPeso, pesosToCentavos } from "../lib/money";

interface Row {
  key: string;
  kind: "in" | "out";
  date: string;
  label: string;
  amount: number;
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
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  async function onAddExpense(ev: React.FormEvent) {
    ev.preventDefault();
    if (!description.trim() || !amount) return;
    await addExpense({
      description: description.trim(),
      amount_centavos: pesosToCentavos(Number(amount)),
      date,
    });
    setDescription("");
    setAmount("");
    setDate(today());
    setExpenses(await listExpenses());
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
        <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">
          Add expense
        </button>
      </form>

      <ul className="divide-y">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2">
              <span className={r.kind === "in" ? "text-green-600" : "text-red-600"}>
                {r.kind === "in" ? "+" : "−"}
              </span>
              <span>{r.label}</span>
            </span>
            <span className={r.kind === "in" ? "text-green-600" : "text-red-600"}>
              {formatPeso(r.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
