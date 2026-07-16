import { useQuery } from "@tanstack/react-query";
import { getClubBookHighlights } from "../services/getClubBookHighlights";

export function useClubBookHighlights(
  clubId: string | undefined,
  bookId: string | undefined,
) {
  return useQuery({
    queryKey: ["club-book-highlights", clubId, bookId],
    queryFn: () => getClubBookHighlights(clubId!, bookId!),
    enabled: Boolean(clubId) && Boolean(bookId),
  });
}
