import type { VercelRequest, VercelResponse } from "@vercel/node";
import { serviceClient, requireAdmin } from "../_lib/requireAdmin";

const ROLES = ["treasurer", "auditor", "admin"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const admin = serviceClient();
  const callerId = await requireAdmin(req, res, admin);
  if (!callerId) return;

  const { email, password, role, title } = (req.body ?? {}) as {
    email?: string; password?: string; role?: string; title?: string;
  };
  if (!email || !password || password.length < 8 || !role || !ROLES.includes(role)) {
    res.status(400).json({ error: "Need email, password (8+ chars) and a valid role." });
    return;
  }

  // Create the auth user, already confirmed so they can log in immediately.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    res.status(400).json({ error: createErr?.message ?? "Could not create account." });
    return;
  }

  // Create/refresh their staff profile row with the assigned role + title.
  const { error: profileErr } = await admin.from("users").upsert(
    { id: created.user.id, email, role, title: title ?? null, status: "active" },
    { onConflict: "id" }
  );
  if (profileErr) {
    res.status(400).json({ error: profileErr.message });
    return;
  }

  res.status(200).json({ ok: true, id: created.user.id });
}
