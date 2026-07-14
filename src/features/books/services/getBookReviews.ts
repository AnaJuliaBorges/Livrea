import { supabase } from "@/lib/supabase";
import type { BookReview } from "../types/book";

type RawReview = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  review: string | null;
  created_at: string;
};

export async function getBookReviews(bookId: string): Promise<BookReview[]> {
  const { data, error } = await supabase.rpc("get_book_reviews", {
    p_book_id: bookId,
  });

  if (error) throw error;

  return ((data ?? []) as RawReview[]).map((raw) => ({
    id: raw.user_id,
    user: {
      id: raw.user_id,
      name: raw.name,
      photo: raw.avatar_url ?? "",
    },
    created_at: raw.created_at,
    rating: raw.rating,
    comment: raw.review ?? "",
    likes: 0,
  }));
}
