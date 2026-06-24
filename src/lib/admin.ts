import { supabase } from "./supabase";

async function authedPost(path: string, body: unknown): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Request failed");
    throw new Error(msg || `Request failed (${res.status})`);
  }
}

export async function createStaff(input: {
  email: string;
  password: string;
  role: "treasurer" | "auditor" | "admin";
  title: string;
}): Promise<void> {
  return authedPost("/api/admin/create-staff", input);
}

export async function resetStaffPassword(userId: string, newPassword: string): Promise<void> {
  return authedPost("/api/admin/reset-password", { userId, newPassword });
}
