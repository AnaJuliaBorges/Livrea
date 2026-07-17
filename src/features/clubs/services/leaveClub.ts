import { supabase } from "@/lib/supabase";

// O chamador se remove do clube. O backend valida: dono não pode sair
// (precisa excluir o clube); quem não é membro recebe erro.
export async function leaveClub(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
}
