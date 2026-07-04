import { supabase } from "./supabase";

export async function getGlobalDark(): Promise<boolean> {
  const { data } = await supabase.from("app_settings").select("dark_mode").eq("id", 1).single();
  return data?.dark_mode ?? false;
}

export async function setGlobalDark(on: boolean): Promise<void> {
  const { error } = await supabase.from("app_settings").update({ dark_mode: on }).eq("id", 1);
  if (error) throw error;
}
