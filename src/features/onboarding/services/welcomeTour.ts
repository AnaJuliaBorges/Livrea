import { supabase } from "@/lib/supabase";

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function getWelcomeTourSeen(): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) return true;

  const { data, error } = await supabase
    .from("profiles")
    .select("welcome_tour_seen")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return data?.welcome_tour_seen === true;
}

export async function markWelcomeTourSeen(): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) return;

  const { error } = await supabase
    .from("profiles")
    .update({ welcome_tour_seen: true })
    .eq("id", userId);

  if (error) throw error;
}
