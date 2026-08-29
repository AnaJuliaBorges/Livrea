import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBook,
  enrichBookWithGoogle,
  needsGoogleEnrichment,
} from "../services/getBook";

export function useBook(id?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["book", id],
    enabled: !!id,
    queryFn: () => getBook(id!),
  });

  const book = query.data;

  useQuery({
    queryKey: ["book-google-enrichment", id],
    enabled: !!book && needsGoogleEnrichment(book),
    staleTime: Infinity,
    queryFn: async () => {
      const enriched = await enrichBookWithGoogle(book!);

      if (enriched) {
        await queryClient.invalidateQueries({ queryKey: ["book", id] });
      }

      return enriched;
    },
  });

  return query;
}
