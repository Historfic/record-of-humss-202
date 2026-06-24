export type Op =
  | { id: string; table: string; kind: "insert"; payload: Record<string, unknown> }
  | { id: string; table: string; kind: "upsert"; payload: Record<string, unknown>; onConflict?: string }
  | { id: string; table: string; kind: "update"; payload: Record<string, unknown>; match: Record<string, unknown> }
  | { id: string; table: string; kind: "delete"; match: Record<string, unknown> };

// Distributive Omit so each member of the union keeps its own keys.
type DistributiveOmit<T, K extends keyof never> = T extends unknown
  ? Omit<T, K>
  : never;

export type OpInput = DistributiveOmit<Op, "id"> & { id?: string };

const KEY = "outbox-v1";

function load(): Op[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Op[]) : [];
  } catch {
    return [];
  }
}

let cache: Op[] = load();

function persist(): void {
  localStorage.setItem(KEY, JSON.stringify(cache));
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function enqueue(op: OpInput): Op {
  const stored = { ...op, id: op.id ?? newId() } as Op;
  cache.push(stored);
  persist();
  return stored;
}

export function peekAll(): Op[] {
  return cache;
}

export function remove(id: string): void {
  cache = cache.filter((o) => o.id !== id);
  persist();
}

export function count(): number {
  return cache.length;
}

export function clear(): void {
  cache = [];
  persist();
}
