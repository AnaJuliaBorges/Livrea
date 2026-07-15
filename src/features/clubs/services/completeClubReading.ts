import { supabase } from "@/lib/supabase";

// Fecha a leitura atual (status -> finished) e o encontro agendado pra ela
// (se houver), sem exigir que um próximo livro já esteja escolhido.
export async function completeClubReading(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("complete_club_reading", {
    p_club_id: clubId,
  });

  if (error) throw error;
}
