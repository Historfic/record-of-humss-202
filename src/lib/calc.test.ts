import { describe, it, expect } from "vitest";
import { evaluate } from "./calc";

describe("evaluate", () => {
  it("adds", () => expect(evaluate("2+3")).toBe("5"));
  it("subtracts for change (e.g. 100 - 78)", () => expect(evaluate("100-78")).toBe("22"));
  it("multiplies and divides", () => {
    expect(evaluate("6*7")).toBe("42");
    expect(evaluate("10/4")).toBe("2.5");
  });
  it("respects operator precedence", () => expect(evaluate("2+3*4")).toBe("14"));
  it("handles decimals", () => expect(evaluate("2.5+2.5")).toBe("5"));
  it("returns 'Error' on malformed input", () => expect(evaluate("2++")).toBe("Error"));
  it("returns empty string for empty input", () => expect(evaluate("")).toBe(""));
});
