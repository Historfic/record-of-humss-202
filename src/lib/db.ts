import { supabase } from "./supabase";
import { isOnline } from "./net";
import { enqueue, peekAll, remove } from "./outbox";
import type { Op, OpInput } from "./outbox";

type SupabaseClient = typeof supabase;

export function applyOp(
  supabaseClient: SupabaseClient,
  op: Op
): PromiseLike<{ error: unknown }> {
  const q = supabaseClient.from(op.table);
  switch (op.kind) {
    case "insert":
      return q.insert(op.payload);
    case "upsert":
      return q.upsert(op.payload, op.onConflict ? { onConflict: op.onConflict } : undefined);
    case "update":
      return q.update(op.payload).match(op.match);
    case "delete":
      return q.delete().match(op.match);
  }
}

export async function write(op: OpInput): Promise<void> {
  if (!isOnline()) {
    enqueue(op);
    return;
  }
  const { error } = await applyOp(supabase, op as Op);
  if (error) {
    enqueue(op);
    return;
  }
}

export async function flushOutbox(): Promise<number> {
  if (!isOnline()) return 0;
  let flushed = 0;
  for (const op of peekAll().slice()) {
    const { error } = await applyOp(supabase, op);
    if (error) break;
    remove(op.id);
    flushed++;
  }
  return flushed;
}
