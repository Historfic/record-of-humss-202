import { describe, it, expect, vi } from "vitest";
vi.mock("./supabase", () => ({ supabase: {} }));
import { balanceCentavos, Expense } from "./expenses";

describe("balanceCentavos", () => {
  it("is total paid minus total spent", () => {
    const paid = [{ amount_centavos: 1000 }, { amount_centavos: 500 }];
    const spent: Expense[] = [{ id: "e1", description: "paper", amount_centavos: 300, date: "2026-06-01", receipt_url: null }];
    expect(balanceCentavos(paid, spent)).toBe(1200);
  });
});
