import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Server-only Supabase client using the SERVICE ROLE key. This key bypasses RLS
// and must NEVER be shipped to the browser — it lives only in Vercel env vars.
export function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Verifies the caller's bearer token and that they are an active admin.
// Returns the admin's user id, or sends an error response and returns null.
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
  admin: SupabaseClient
): Promise<string | null> {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "Not signed in." });
    return null;
  }
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) {
    res.status(401).json({ error: "Invalid session." });
    return null;
  }
  const { data: profile } = await admin
    .from("users")
    .select("role,status")
    .eq("id", userData.user.id)
    .single();
  if (!profile || profile.role !== "admin" || profile.status !== "active") {
    res.status(403).json({ error: "Admins only." });
    return null;
  }
  return userData.user.id;
}
