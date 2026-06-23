import { describe, it, expect } from "vitest";
import { canEditData, isAdmin, Role } from "./roles";

describe("roles", () => {
  it("admin can edit data and is admin", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(canEditData("admin")).toBe(true);
  });
  it("treasurer and auditor can edit data but are not admin", () => {
    for (const r of ["treasurer", "auditor"] as Role[]) {
      expect(canEditData(r)).toBe(true);
      expect(isAdmin(r)).toBe(false);
    }
  });
  it("guest can neither edit nor admin", () => {
    expect(canEditData("guest")).toBe(false);
    expect(isAdmin("guest")).toBe(false);
  });
});
