import { describe, it, expect, vi } from "vitest";
vi.mock("./supabase", () => ({ supabase: {} }));
import { totalCentavos } from "./funds";

describe("totalCentavos", () => {
  it("sums amount_centavos of a list", () => {
    const items = [{ amount_centavos: 200 }, { amount_centavos: 1050 }];
    expect(totalCentavos(items)).toBe(1250);
  });
  it("returns 0 for empty", () => {
    expect(totalCentavos([])).toBe(0);
  });
});
