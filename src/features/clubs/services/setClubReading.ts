import { supabase } from "@/lib/supabase";

export async function setClubReading(
  clubId: string,
  bookId: string,
): Promise<void> {
  const { error } = await supabase.rpc("set_club_reading", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;
}
