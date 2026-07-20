import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertBook } from "@/features/books";
import { setClubReading } from "../services/setClubReading";
import type { ClubReadingSearchResult } from "../services/searchClubReadingBooks";

// Define a leitura atual a partir de um resultado da busca: livros externos
// passam pelo upsert_book (criação mínima por ISBN) antes do set_club_reading.
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
