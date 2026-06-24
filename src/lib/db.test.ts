import { describe, it, expect, vi, beforeEach } from "vitest";

const { insert, upsert } = vi.hoisted(() => ({
  insert: vi.fn().mockResolvedValue({ error: null }),
  upsert: vi.fn().mockResolvedValue({ error: null }),
}));
vi.mock("./supabase", () => ({
  supabase: { from: () => ({ insert, upsert }) },
}));
const { isOnline } = vi.hoisted(() => ({ isOnline: vi.fn() }));
vi.mock("./net", () => ({ isOnline, onNetworkChange: () => () => {} }));

import { write, flushOutbox } from "./db";
import { count, clear } from "./outbox";

beforeEach(() => {
  localStorage.clear();
  clear();
  insert.mockClear();
});

describe("db.write", () => {
  it("when online, writes straight to supabase and does not queue", async () => {
    isOnline.mockReturnValue(true);
    await write({ table: "students", kind: "insert", payload: { name: "A" } });
    expect(insert).toHaveBeenCalledWith({ name: "A" });
    expect(count()).toBe(0);
  });
  it("when offline, queues the op instead of calling supabase", async () => {
    isOnline.mockReturnValue(false);
    await write({ table: "students", kind: "insert", payload: { name: "B" } });
    expect(insert).not.toHaveBeenCalled();
    expect(count()).toBe(1);
  });
  it("flushOutbox replays queued ops when back online", async () => {
    isOnline.mockReturnValue(false);
    await write({ table: "students", kind: "insert", payload: { name: "C" } });
    expect(count()).toBe(1);
    isOnline.mockReturnValue(true);
    const n = await flushOutbox();
    expect(n).toBe(1);
    expect(insert).toHaveBeenCalledWith({ name: "C" });
    expect(count()).toBe(0);
  });
});
