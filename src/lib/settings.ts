import { supabase } from "./supabase";

export async function getGlobalDark(): Promise<boolean> {
  const { data } = await supabase.from("app_settings").select("dark_mode").eq("id", 1).single();
  return data?.dark_mode ?? false;
}

export async function setGlobalDark(on: boolean): Promise<void> {
  const { error } = await supabase.from("app_settings").update({ dark_mode: on }).eq("id", 1);
  if (error) throw error;
}

// The current signed-in user's admin-assigned theme:
//   true = dark, false = light, null = let them choose.
export async function getMyDark(): Promise<boolean | null> {
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user?.id;
  if (!uid) return null;
  const { data } = await supabase.from("users").select("dark_mode").eq("id", uid).single();
  return (data?.dark_mode ?? null) as boolean | null;
}
