import { supabase } from "@/lib/supabase";

// Owner-only (o backend valida): nomeia um participante como admin.
export async function promoteClubMember(
  clubId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.rpc("promote_club_member", {
    p_club_id: clubId,
    p_user_id: userId,
  });

  if (error) throw error;
}

// Owner-only: rebaixa um admin de volta a participante comum.
export async function demoteClubMember(
  clubId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.rpc("demote_club_member", {
    p_club_id: clubId,
    p_user_id: userId,
  });

  if (error) throw error;
}

// Owner-only: remove um participante do clube.
export async function removeClubMember(
  clubId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.rpc("remove_club_member", {
    p_club_id: clubId,
    p_user_id: userId,
  });

  if (error) throw error;
}
