import { supabase } from "./supabase";
import { Role } from "./roles";

export interface Staff {
  id: string;
  email: string;
  role: Exclude<Role, "guest">;
  title: string | null;
  status: "active" | "revoked" | "pending";
}

export async function listStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,role,title,status");
  if (error) throw error;
  return (data ?? []) as Staff[];
}

export async function setStaffRole(
  id: string,
  role: Staff["role"],
  title: string
): Promise<void> {
  const { error } = await supabase.from("users").update({ role, title }).eq("id", id);
  if (error) throw error;
}

export async function setStaffStatus(id: string, status: Staff["status"]): Promise<void> {
  const { error } = await supabase.from("users").update({ status }).eq("id", id);
  if (error) throw error;
}
