import { useEffect, useMemo, useState } from "react";
import { listStudents } from "../lib/students";
import type { Student } from "../lib/students";
import { listCollections, listPayments, totalCentavos } from "../lib/funds";
import type { Collection, Payment } from "../lib/funds";
import { buildColumns, cellPaid } from "../lib/grid";
import type { Column, Granularity } from "../lib/grid";
import { formatPeso, paymentStatus } from "../lib/money";
import type { PayStatus } from "../lib/money";

const STATUS_BG: Record<PayStatus, string> = {
  full: "bg-green-500 text-white",
  partial: "bg-orange-400 text-white",
  unpaid: "bg-red-500 text-white",
  none: "bg-gray-200",
};

interface Selection {
  student: Student;
  col: Column;
  paid: number;
}

export function TransparencyGrid() {
  const [students, setStudents] = useState<Student[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [selection, setSelection] = useState<Selection | null>(null);

  useEffect(() => {
    void (async () => {
      const [s, c, p] = await Promise.all([
        listStudents(),
        listCollections(),
        listPayments(),
      ]);
      setStudents(s);
      setCollections(c);
      setPayments(p);
    })();
  }, []);

  const columns = useMemo(
    () => buildColumns(collections, granularity),
    [collections, granularity],
  );

  const grans: Granularity[] = ["day", "week", "month"];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {grans.map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`rounded px-3 py-2 text-sm capitalize ${
                granularity === g ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total collected</div>
          <div data-testid="class-total" className="text-lg font-bold">
            {formatPeso(totalCentavos(payments))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left">
                Student
              </th>
              {columns.map((col) => (
                <th key={col.key} className="min-w-[5rem] px-3 py-2 text-center">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium">
                  {student.name}
                </td>
                {columns.map((col) => {
                  const paid = cellPaid(payments, student.id, col);
                  const status = paymentStatus(col.dueCentavos, paid);
                  return (
                    <td key={col.key} className="p-0.5">
                      <button
                        data-testid={`cell-${student.id}-${col.key}`}
                        onClick={() => setSelection({ student, col, paid })}
                        className={`h-11 w-full min-w-[4rem] rounded ${STATUS_BG[status]}`}
                      >
                        {formatPeso(paid)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selection && (
        <div className="mt-4 rounded border border-gray-300 p-4" data-testid="cell-detail">
          <div className="font-semibold">{selection.student.name}</div>
          <div className="text-sm text-gray-600">{selection.col.label}</div>
          <div className="mt-2">
            {formatPeso(selection.paid)} of {formatPeso(selection.col.dueCentavos)}
          </div>
          <button
            onClick={() => setSelection(null)}
            className="mt-2 rounded bg-gray-100 px-3 py-1 text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
