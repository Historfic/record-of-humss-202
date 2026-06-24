import { describe, it, expect, vi, beforeEach } from "vitest";
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("./supabase", () => ({ supabase: { auth: { getSession } } }));
import { createStaff } from "./admin";

beforeEach(() => {
  getSession.mockResolvedValue({ data: { session: { access_token: "tok123" } } });
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "" }) as any;
});

describe("createStaff", () => {
  it("POSTs to the create-staff endpoint with auth + body", async () => {
    await createStaff({ email: "t@x.com", password: "pw12345678", role: "treasurer", title: "Treasurer" });
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/admin/create-staff", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer tok123" }),
      body: JSON.stringify({ email: "t@x.com", password: "pw12345678", role: "treasurer", title: "Treasurer" }),
    }));
  });
  it("throws on a non-ok response", async () => {
    (globalThis.fetch as any).mockResolvedValue({ ok: false, status: 400, text: async () => "bad" });
    await expect(createStaff({ email: "a", password: "b", role: "auditor", title: "" })).rejects.toThrow();
  });
});
