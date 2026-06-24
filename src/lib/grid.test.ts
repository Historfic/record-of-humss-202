import { describe, it, expect } from "vitest";
import { periodKey, buildColumns, cellPaid } from "./grid";
import type { Collection, Payment } from "./funds";

const collections: Collection[] = [
  { id: "c1", type: "daily", label: "Mon", amount_centavos: 200, date: "2026-06-01" },
  { id: "c2", type: "daily", label: "Tue", amount_centavos: 200, date: "2026-06-02" },
  { id: "c3", type: "daily", label: "Jul", amount_centavos: 200, date: "2026-07-06" },
];

describe("periodKey", () => {
  it("day key is the date", () => expect(periodKey("2026-06-01", "day")).toBe("2026-06-01"));
  it("month key is YYYY-MM", () => expect(periodKey("2026-06-01", "month")).toBe("2026-06"));
  it("week key groups same ISO week", () => {
    expect(periodKey("2026-06-01", "week")).toBe(periodKey("2026-06-02", "week"));
    expect(periodKey("2026-06-01", "week")).not.toBe(periodKey("2026-07-06", "week"));
  });
});

describe("buildColumns", () => {
  it("groups collections into ordered period columns with due totals", () => {
    const cols = buildColumns(collections, "month");
    expect(cols.map((c) => c.key)).toEqual(["2026-06", "2026-07"]);
    expect(cols[0].dueCentavos).toBe(400); // two June dailies
    expect(cols[1].dueCentavos).toBe(200);
    expect(cols[0].collectionIds.sort()).toEqual(["c1", "c2"]);
  });
});

describe("cellPaid", () => {
  it("sums a student's payments for the column's collections", () => {
    const payments: Payment[] = [
      { id: "p1", student_id: "s1", collection_id: "c1", amount_centavos: 200, paid_at: "" },
      { id: "p2", student_id: "s1", collection_id: "c2", amount_centavos: 100, paid_at: "" },
      { id: "p3", student_id: "s2", collection_id: "c1", amount_centavos: 200, paid_at: "" },
    ];
    const col = buildColumns(collections, "month")[0]; // June, c1+c2
    expect(cellPaid(payments, "s1", col)).toBe(300);
    expect(cellPaid(payments, "s2", col)).toBe(200);
    expect(cellPaid(payments, "s3", col)).toBe(0);
  });
});
