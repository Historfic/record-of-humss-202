import type { Collection, Payment } from "./funds";

export type Granularity = "day" | "week" | "month";

export interface Column {
  key: string;
  label: string;
  dueCentavos: number;
  collectionIds: string[];
}

export function periodKey(isoDate: string, g: Granularity): string {
  if (g === "day") return isoDate;
  if (g === "month") return isoDate.slice(0, 7);
  // week: ISO week number
  const d = new Date(isoDate + "T00:00:00Z");
  const day = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - day + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function labelFor(key: string, g: Granularity): string {
  if (g === "month") {
    const [y, m] = key.split("-");
    const names = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${names[Number(m) - 1]} ${y}`;
  }
  return key; // day -> ISO date; week -> YYYY-Www
}

export function buildColumns(collections: Collection[], g: Granularity): Column[] {
  const map = new Map<string, Column>();
  for (const c of collections) {
    const key = periodKey(c.date, g);
    let col = map.get(key);
    if (!col) {
      col = { key, label: labelFor(key, g), dueCentavos: 0, collectionIds: [] };
      map.set(key, col);
    }
    col.dueCentavos += c.amount_centavos;
    col.collectionIds.push(c.id);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function cellPaid(payments: Payment[], studentId: string, col: Column): number {
  const ids = new Set(col.collectionIds);
  return payments
    .filter((p) => p.student_id === studentId && ids.has(p.collection_id))
    .reduce((s, p) => s + p.amount_centavos, 0);
}
