import { supabase } from "@/lib/supabase";

export interface ClubBookRating {
  // média das notas dos membros do clube pro livro (null = ninguém avaliou)
  clubAverage: number | null;
  clubCount: number;
  // nota do próprio usuário pro livro (null = ainda não avaliou)
  myRating: number | null;
}

type RawClubBookRating = {
  club_average: number | null;
  club_count: number;
  my_rating: number | null;
};

export async function getClubBookRating(
  clubId: string,
  bookId: string,
): Promise<ClubBookRating> {
  const { data, error } = await supabase.rpc("get_club_book_rating", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  const raw = (data ?? {}) as RawClubBookRating;

  return {
    clubAverage: raw.club_average,
    clubCount: raw.club_count ?? 0,
    myRating: raw.my_rating,
  };
}
