import { useInfiniteQuery } from "@tanstack/react-query";
import { reportError } from "@/lib/reportError";
import { searchIsbndbByGenre, searchIsbndbByQuery } from "../api/isbndb";
import { mapIsbndb } from "../services/mapIsbndb";

export function useSearchBooks(genres: string[], query?: string) {
  const queryFn = async ({ pageParam = 1 }) => {
    const allBooks: ReturnType<typeof mapIsbndb>[] = [];

    // Se houver query (busca customizada), usar apenas ela
    if (query && query.length > 2) {
      const books = await searchIsbndbByQuery(query, 20, pageParam);
      allBooks.push(...books.map(mapIsbndb));
    } else if (genres.length > 0) {
      // Fazer requests paralelas para cada gênero
      const results = await Promise.allSettled(
        genres.map((genre) =>
          searchIsbndbByGenre(genre, 20, pageParam).then((books) =>
            books.map(mapIsbndb),
          ),
        ),
      );

      const rejected = results.flatMap((result, index) =>
        result.status === "rejected"
          ? [{ genre: genres[index], reason: result.reason }]
          : [],
      );

      // TODOS os gêneros falharem é a ISBNDB fora do ar (assinatura vencida,
      // cota, 401) — propaga pra tela poder dizer "não foi possível buscar"
      // em vez de "nenhum livro encontrado", que manda investigar o lugar
      // errado. Antes isso virava lista vazia e sumia.
      if (rejected.length === genres.length) throw rejected[0].reason;

      // Falha parcial só encolhe a lista, então não quebra a tela — mas
      // também não pode sumir: vai pro funil como qualquer outro erro.
      rejected.forEach(({ genre, reason }) =>
        reportError(reason, {
          source: "query",
          detail: `isbndb subject "${genre}"`,
        }),
      );

      results.forEach((result) => {
        if (result.status === "fulfilled") allBooks.push(...result.value);
      });
    }

    // Deduplica por ISBN dentro da página
    const isbnMap = new Map<string, (typeof allBooks)[0]>();

    for (const book of allBooks) {
      const isbn = book.info.isbn?.toLowerCase().trim();

      if (isbn && !isbnMap.has(isbn)) {
        isbnMap.set(isbn, book);
      }
    }

    const deduplicatedPageBooks = Array.from(isbnMap.values());

    // Filtra livros que começam com "box" (case-insensitive)
    const filteredBooks = deduplicatedPageBooks.filter(
      (book) => !book.info.title.toLowerCase().startsWith("box"),
    );

    return filteredBooks;
  };

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["isbndb", genres, query],
    queryFn,
    getNextPageParam: (lastPage, allPages) => {
      // Se a última página retornou menos livros que o pageSize, não há próxima página
      if (lastPage.length < 20) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: genres.length > 0 || (query ? query.length > 2 : false),
  });

  // Combina todas as páginas e deduplica globalmente
  const allBooksFromPages = data?.pages.flat() ?? [];

  // Deduplica novamente para garantir que não há duplicatas entre páginas
  const globalDeduplicatedBooks = Array.from(
    new Map(allBooksFromPages.map((book) => [book.info.isbn, book])).values(),
  );

  return {
    data: globalDeduplicatedBooks,
    isLoading,
    isError,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage: isFetchingNextPage ?? false,
    status,
  };
}
