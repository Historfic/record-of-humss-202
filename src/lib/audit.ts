import { supabase } from "./supabase";

export interface AuditEntry {
  id: string;
  table_name: string;
  action: string; // INSERT | UPDATE | DELETE
  row_id: string | null;
  actor_email: string | null;
  at: string;
}

// A friendly one-line description of an audit entry, e.g. "recorded a payment".
export function describeAudit(e: AuditEntry): string {
  const noun: Record<string, string> = {
    payments: "a payment",
    expenses: "an expense",
    attendance: "an attendance mark",
    collections: "a due/collection",
    students: "a student",
    calendar_notes: "a calendar note",
  };
  const verb =
    e.action === "INSERT" ? "added" : e.action === "DELETE" ? "removed" : "updated";
  return `${verb} ${noun[e.table_name] ?? e.table_name}`;
}

export async function listAudit(limit = 150): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from("audit_log")
    .select("id,table_name,action,row_id,actor_email,at")
    .order("at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditEntry[];
}
