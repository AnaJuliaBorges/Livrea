import { supabase } from "@/lib/supabase";

// Clube público: entra direto em club_members. Clube privado: cria um
// club_join_requests pendente (idempotente) para o admin aprovar/recusar.
export async function requestToJoinClub(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("request_to_join_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
}
