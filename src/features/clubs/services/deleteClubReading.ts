import { supabase } from "@/lib/supabase";

// Remove a leitura atual sem arquivá-la no histórico (diferente de
// completeClubReading, que finaliza e manda pro histórico).
export async function deleteClubReading(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_club_reading", {
    p_club_id: clubId,
  });

  if (error) throw error;
}
