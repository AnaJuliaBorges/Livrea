import { useQuery } from "@tanstack/react-query";
import { getClubBookRating } from "../services/clubReadings";

export function useClubBookRating(
  clubId: string | undefined,
  bookId: string | undefined,
) {
  return useQuery({
    queryKey: ["club-book-rating", clubId, bookId],
    queryFn: () => getClubBookRating(clubId!, bookId!),
    enabled: Boolean(clubId) && Boolean(bookId),
  });
}
