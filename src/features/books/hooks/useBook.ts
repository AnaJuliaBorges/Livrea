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

  // Fase 2: com a página já exibindo os dados da ISBNDB, o Google Books
  // completa em segundo plano o que faltar (imagens grandes, gêneros,
  // nota média); a invalidação atualiza a tela quando terminar
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
