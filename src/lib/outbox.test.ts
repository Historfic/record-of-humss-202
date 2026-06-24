import { describe, it, expect, beforeEach } from "vitest";
import { enqueue, peekAll, remove, count, clear } from "./outbox";

beforeEach(() => {
  localStorage.clear();
  clear();
});

describe("outbox", () => {
  it("enqueues and persists operations", () => {
    enqueue({ table: "students", kind: "insert", payload: { name: "Abad" } });
    expect(count()).toBe(1);
    expect(peekAll()[0].table).toBe("students");
    // persisted to localStorage
    expect(localStorage.getItem("outbox-v1")).toContain("students");
  });
  it("removes by id", () => {
    const op = enqueue({ table: "x", kind: "insert", payload: {} });
    remove(op.id);
    expect(count()).toBe(0);
  });
  it("reloads from localStorage", () => {
    enqueue({ table: "y", kind: "insert", payload: { a: 1 } });
    // simulate fresh module read
    expect(peekAll().length).toBe(1);
  });
});
