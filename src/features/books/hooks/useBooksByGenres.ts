import { useQuery } from "@tanstack/react-query";
import { getBooksByGenres } from "../services/getBooksByGenres";

export function useBooksByGenres(genreIds: number[]) {
  return useQuery({
    queryKey: ["books-by-genres", genreIds],
    queryFn: () => getBooksByGenres(genreIds),
    enabled: genreIds.length > 0,
  });
}
