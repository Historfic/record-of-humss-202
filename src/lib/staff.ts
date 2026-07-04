import { supabase } from "./supabase";
import { Role } from "./roles";

export interface Staff {
  id: string;
  email: string;
  role: Exclude<Role, "guest">;
  title: string | null;
  status: "active" | "revoked" | "pending";
  dark_mode: boolean | null; // admin-assigned theme: true=dark, false=light, null=auto
}

export async function listStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,role,title,status,dark_mode");
  if (error) throw error;
  return (data ?? []) as Staff[];
}

// Assign a person's theme: true=dark, false=light, null=let them choose.
export async function setStaffDark(id: string, value: boolean | null): Promise<void> {
  const { error } = await supabase.from("users").update({ dark_mode: value }).eq("id", id);
  if (error) throw error;
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
