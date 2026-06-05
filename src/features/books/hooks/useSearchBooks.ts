import { useInfiniteQuery } from "@tanstack/react-query";
import { searchIsbndbByGenre, searchIsbndbByQuery } from "../api/isbndb";
import { mapIsbndb } from "../services/mapIsbndb";

export function useSearchBooks(genres: string[], query?: string) {
  console.log("useSearchBooks called with genres:", genres, "query:", query);

  const queryFn = async ({ pageParam = 1 }) => {
    console.log(
      "useSearchBooks queryFn executing with genres:",
      genres,
      "query:",
      query,
      "page:",
      pageParam,
    );
    const allBooks: ReturnType<typeof mapIsbndb>[] = [];

    // Se houver query (busca customizada), usar apenas ela
    if (query && query.length > 2) {
      console.log("Searching by query:", query, "page:", pageParam);
      const books = await searchIsbndbByQuery(query, 20, pageParam);
      allBooks.push(...books.map(mapIsbndb));
    } else if (genres.length > 0) {
      // Fazer requests paralelas para cada gênero
      const genreRequests = genres.map((genre) =>
        searchIsbndbByGenre(genre, 20, pageParam)
          .then((books) => {
            console.log(
              `Got ${books.length} books for genre: ${genre} page: ${pageParam}`,
            );
            return books.map(mapIsbndb);
          })
          .catch((error) => {
            console.error(`Erro ao buscar gênero "${genre}":`, error);
            return [];
          }),
      );

      const results = await Promise.all(genreRequests);
      results.forEach((books) => allBooks.push(...books));
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
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage: isFetchingNextPage ?? false,
    status,
  };
}
