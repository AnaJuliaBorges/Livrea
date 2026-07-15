import { supabase } from "@/lib/supabase";

export async function deleteClub(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
}
