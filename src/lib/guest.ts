import { supabase } from "./supabase";

export async function logGuestVisit(name: string): Promise<void> {
  const { error } = await supabase.from("guest_log").insert({ name });
  if (error) throw error;
}

export interface GuestVisit {
  id: string;
  name: string;
  visited_at: string;
}

export async function listGuestVisits(): Promise<GuestVisit[]> {
  const { data, error } = await supabase
    .from("guest_log")
    .select("id,name,visited_at")
    .order("visited_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GuestVisit[];
}
