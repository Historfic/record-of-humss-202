export type Role = "admin" | "treasurer" | "auditor" | "guest";

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

export function canEditData(role: Role): boolean {
  return role === "admin" || role === "treasurer" || role === "auditor";
}
