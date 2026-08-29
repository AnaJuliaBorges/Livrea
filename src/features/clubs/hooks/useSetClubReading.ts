import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertBook } from "@/features/books";
import { setClubReading } from "../services/clubReadings";
import type { ClubReadingSearchResult } from "../services/searchClubReadingBooks";

export function useSetClubReading(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: ClubReadingSearchResult) => {
      const bookId =
        result.source === "db"
          ? result.bookId!
          : await upsertBook(result.externalBook!);

      await setClubReading(clubId, bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
