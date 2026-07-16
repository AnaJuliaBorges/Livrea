import { useQuery } from "@tanstack/react-query";
import { getClubBookReviews } from "../services/getClubBookReviews";

export function useClubBookReviews(
  clubId: string | undefined,
  bookId: string | undefined,
) {
  return useQuery({
    queryKey: ["club-book-reviews", clubId, bookId],
    queryFn: () => getClubBookReviews(clubId!, bookId!),
    enabled: Boolean(clubId) && Boolean(bookId),
  });
}
