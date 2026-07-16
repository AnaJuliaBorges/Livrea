import { supabase } from "@/lib/supabase";

export interface ClubBookReview {
  userId: string;
  name: string;
  avatarUrl: string | null;
  rating: number | null;
  review: string;
}

type RawClubBookReview = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  rating: number | null;
  review: string;
};

// Resenhas dos membros do clube pro livro — considera edições equivalentes
// (de-para por título+autores feito na RPC via get_equivalent_editions)
export async function getClubBookReviews(
  clubId: string,
  bookId: string,
): Promise<ClubBookReview[]> {
  const { data, error } = await supabase.rpc("get_club_book_reviews", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubBookReview[]).map((review) => ({
    userId: review.user_id,
    name: review.name,
    avatarUrl: review.avatar_url,
    rating: review.rating,
    review: review.review,
  }));
}
