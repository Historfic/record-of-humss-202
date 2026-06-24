import { useEffect, useState } from "react";
import { listStudents, addStudent } from "../lib/students";
import type { Student } from "../lib/students";
import { listCollections, addCollection, recordPayment } from "../lib/funds";
import type { Collection } from "../lib/funds";
import { pesosToCentavos, formatPeso } from "../lib/money";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StaffEntry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [studentName, setStudentName] = useState("");

  const [colType, setColType] = useState<Collection["type"]>("daily");
  const [colLabel, setColLabel] = useState("");
  const [colAmount, setColAmount] = useState("");
  const [colDate, setColDate] = useState(todayISO());

  const [payStudent, setPayStudent] = useState("");
  const [payCollection, setPayCollection] = useState("");
  const [payAmount, setPayAmount] = useState("");

  async function refreshStudents() {
    const list = await listStudents();
    setStudents(list);
    if (list.length && !payStudent) setPayStudent(list[0].id);
  }

  async function refreshCollections() {
    const list = await listCollections();
    setCollections(list);
    if (list.length && !payCollection) setPayCollection(list[0].id);
  }

  useEffect(() => {
    void refreshStudents();
    void refreshCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAddStudent() {
    await addStudent(studentName.trim());
    setStudentName("");
    await refreshStudents();
  }

  async function onCreateCollection() {
    await addCollection({
      type: colType,
      label: colLabel,
      amount_centavos: pesosToCentavos(Number(colAmount)),
      date: colDate,
    });
    setColLabel("");
    setColAmount("");
    await refreshCollections();
  }

  async function onRecordPayment() {
    await recordPayment({
      student_id: payStudent,
      collection_id: payCollection,
      amount_centavos: pesosToCentavos(Number(payAmount)),
    });
    setPayAmount("");
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Add student</h2>
        <input
          className="rounded border p-2"
          placeholder="New student name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 p-2 text-white"
          onClick={() => void onAddStudent()}
        >
          Add student
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">New collection (due)</h2>
        <select
          className="rounded border p-2"
          aria-label="Collection type"
          value={colType}
          onChange={(e) => setColType(e.target.value as Collection["type"])}
        >
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="special">special</option>
        </select>
        <input
          className="rounded border p-2"
          placeholder="Label"
          aria-label="Collection label"
          value={colLabel}
          onChange={(e) => setColLabel(e.target.value)}
        />
        <input
          className="rounded border p-2"
          type="number"
          step="0.01"
          placeholder="Amount (pesos)"
          aria-label="Collection amount"
          value={colAmount}
          onChange={(e) => setColAmount(e.target.value)}
        />
        <input
          className="rounded border p-2"
          type="date"
          aria-label="Collection date"
          value={colDate}
          onChange={(e) => setColDate(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 p-2 text-white"
          onClick={() => void onCreateCollection()}
        >
          Create
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Record payment</h2>
        <select
          className="rounded border p-2"
          aria-label="Student"
          value={payStudent}
          onChange={(e) => setPayStudent(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="rounded border p-2"
          aria-label="Collection"
          value={payCollection}
          onChange={(e) => setPayCollection(e.target.value)}
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {`${c.label} (${formatPeso(c.amount_centavos)})`}
            </option>
          ))}
        </select>
        <input
          className="rounded border p-2"
          type="number"
          step="0.01"
          placeholder="Amount (pesos)"
          data-testid="pay-amount"
          aria-label="Payment amount"
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 p-2 text-white"
          onClick={() => void onRecordPayment()}
        >
          Record payment
        </button>
      </section>
    </div>
  );
}
