import { useQuery } from "@tanstack/react-query";
import { getClubReadingReaders } from "../services/getClubReadingReaders";

export function useClubReadingReaders(
  clubId: string | undefined,
  bookId: string | undefined,
) {
  return useQuery({
    queryKey: ["club-reading-readers", clubId, bookId],
    queryFn: () => getClubReadingReaders(clubId!, bookId!),
    enabled: Boolean(clubId) && Boolean(bookId),
  });
}
