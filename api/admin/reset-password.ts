import type { VercelRequest, VercelResponse } from "@vercel/node";
import { serviceClient, requireAdmin } from "../_lib/requireAdmin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const admin = serviceClient();
  const callerId = await requireAdmin(req, res, admin);
  if (!callerId) return;

  const { userId, newPassword } = (req.body ?? {}) as { userId?: string; newPassword?: string };
  if (!userId || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "Need a user and a new password (8+ chars)." });
    return;
  }

  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(200).json({ ok: true });
}
