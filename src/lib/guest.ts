import { supabase } from "./supabase";

export async function logGuestVisit(name: string): Promise<void> {
  const { error } = await supabase.from("guest_log").insert({ name });
  if (error) throw error;
}
