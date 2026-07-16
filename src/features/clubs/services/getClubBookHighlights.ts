import { supabase } from "@/lib/supabase";

export interface ClubBookHighlight {
  userId: string;
  name: string;
  avatarUrl: string | null;
  // página da edição que o próprio membro está lendo — varia entre edições,
  // por isso o agrupamento de citações é por texto (groupHighlights), não
  // por página
  page: number;
  quote: string;
}

type RawClubBookHighlight = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  page: number;
  quote: string;
};

export async function getClubBookHighlights(
  clubId: string,
  bookId: string,
): Promise<ClubBookHighlight[]> {
  const { data, error } = await supabase.rpc("get_club_book_highlights", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubBookHighlight[]).map((highlight) => ({
    userId: highlight.user_id,
    name: highlight.name,
    avatarUrl: highlight.avatar_url,
    page: highlight.page,
    quote: highlight.quote,
  }));
}
