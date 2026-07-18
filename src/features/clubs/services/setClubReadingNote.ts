import { supabase } from "@/lib/supabase";

// Admin-only (a RPC valida). String vazia limpa a nota.
export async function setClubReadingNote(
  readingId: string,
  note: string,
): Promise<void> {
  const { error } = await supabase.rpc("set_club_reading_note", {
    p_reading_id: readingId,
    p_note: note,
  });

  if (error) throw error;
}
