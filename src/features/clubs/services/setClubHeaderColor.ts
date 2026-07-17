import { supabase } from "@/lib/supabase";

// admin-only (a RPC valida); a cor é uma chave da paleta HEADER_COLORS
export async function setClubHeaderColor(
  clubId: string,
  color: string,
): Promise<void> {
  const { error } = await supabase.rpc("set_club_header_color", {
    p_club_id: clubId,
    p_color: color,
  });

  if (error) throw error;
}
