import { describe, it, expect } from "vitest";
import { formatPeso, paymentStatus, pesosToCentavos } from "./money";

describe("formatPeso", () => {
  it("formats centavos as peso string", () => {
    expect(formatPeso(0)).toBe("₱0.00");
    expect(formatPeso(200)).toBe("₱2.00");
    expect(formatPeso(1050)).toBe("₱10.50");
  });
});

describe("pesosToCentavos", () => {
  it("converts a peso number to integer centavos", () => {
    expect(pesosToCentavos(2)).toBe(200);
    expect(pesosToCentavos(10.5)).toBe(1050);
    expect(pesosToCentavos(0)).toBe(0);
  });
});

describe("paymentStatus", () => {
  it("returns 'unpaid' when nothing paid against a positive due", () => {
    expect(paymentStatus(1000, 0)).toBe("unpaid");
  });
  it("returns 'partial' when some but not all paid", () => {
    expect(paymentStatus(1000, 600)).toBe("partial");
  });
  it("returns 'full' when paid meets or exceeds due", () => {
    expect(paymentStatus(1000, 1000)).toBe("full");
    expect(paymentStatus(1000, 1200)).toBe("full");
  });
  it("returns 'none' when there is no due in the period", () => {
    expect(paymentStatus(0, 0)).toBe("none");
  });
});
