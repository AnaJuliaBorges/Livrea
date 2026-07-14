import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileWarning } from "lucide-react";
import { toast } from "sonner";
import { SearchInput } from "@/components/SearchInput";
import { BookListCard } from "../components/BookListCard";
import { useUpsertBook } from "../hooks/useUpsertBook";
import type { Book } from "../types/book";
import { useProfileGenreIds } from "@/features/profile/hooks/useProfileGenreIds";
import { useGenres } from "../hooks/useGenres";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchBooks } from "../hooks/useSearchBooks";
import { useBooksByGenres } from "../hooks/useBooksByGenres";
import { getSelectedGenreNames } from "../utils/genreUtils";

export default function ListBooks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { mutateAsync: upsertBook, isPending: isOpeningBook } =
    useUpsertBook();

  // livro externo ainda não existe no banco: cria o registro mínimo e
  // navega — a página de detalhes completa os dados via Google Books
  async function openExternalBook(book: Book) {
    if (isOpeningBook) return;

    try {
      const bookId = await upsertBook(book);
      navigate(`/livros/${bookId}`);
    } catch {
      toast.error("Não foi possível abrir o livro. Tente novamente.");
    }
  }

  const { data: genreIds = [], isLoading: isLoadingGenreIds } =
    useProfileGenreIds();
  const { data: allGenres = [], isLoading: isLoadingGenres } = useGenres();

  const genreNames = useMemo(
    () => getSelectedGenreNames(genreIds, allGenres),
    [genreIds, allGenres],
  );

  const isSearching = search.length > 0;

  const { data: dbBooks = [], isLoading: isLoadingDbBooks } =
    useBooksByGenres(genreIds);

  const {
    data: externalBooks,
    isLoading: isLoadingExternal,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchBooks(
    isSearching ? [] : genreNames,
    isSearching ? debouncedSearch : undefined,
  );

  // na recomendação, livros que já estão no banco não repetem na
  // parte vinda da ISBNDB
  const dedupedExternalBooks = useMemo(() => {
    if (isSearching) return externalBooks;

    const dbIsbns = new Set(dbBooks.map((book) => book.isbn?.toLowerCase()));

    return externalBooks.filter(
      (book) => !dbIsbns.has(book.info.isbn?.toLowerCase() ?? ""),
    );
  }, [externalBooks, dbBooks, isSearching]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!endRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 },
    );

    observer.observe(endRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isLoading =
    isLoadingGenreIds ||
    isLoadingGenres ||
    isLoadingExternal ||
    (!isSearching && isLoadingDbBooks);

  const hasNoGenres =
    !isLoadingGenreIds && !isLoadingGenres && genreIds.length === 0;

  const showDbBooks = !isSearching && dbBooks.length > 0;
  const isEmpty =
    dedupedExternalBooks.length === 0 && (isSearching || dbBooks.length === 0);

  return (
    <div className="flex flex-col gap-6 mb-10">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar livros"
      />

      {hasNoGenres && !isSearching ? (
        <div className="flex flex-col h-[70vh] justify-center items-center text-center gap-5">
          <FileWarning className="inline-block text-gray-300" size={86} />
          <p>
            Você ainda não tem gêneros favoritos. <br />
            Escolha seus gêneros no{" "}
            <Link to="/perfil" className="text-primary underline">
              seu perfil
            </Link>{" "}
            para ver recomendações.
          </p>
        </div>
      ) : isLoading && isEmpty ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Procurando livros...</p>
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">
            Nenhum livro encontrado
          </p>
        </div>
      ) : (
        <>
          <p className="font-medium">
            {isSearching ? "Resultados da busca" : "Recomendados para você"}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {showDbBooks &&
              dbBooks.map((book) => (
                <BookListCard
                  key={book.id}
                  title={book.title}
                  image={book.image}
                  to={`/livros/${book.id}`}
                />
              ))}

            {dedupedExternalBooks.map((book) => (
              <BookListCard
                key={book.google_id}
                title={book.info.title}
                image={book.image.thumbnail || book.image.smallThumbnail}
                onClick={
                  book.info.isbn ? () => openExternalBook(book) : undefined
                }
              />
            ))}
          </div>

          {hasNextPage && (
            <div ref={endRef} className="flex justify-center py-4">
              {isFetchingNextPage && (
                <p className="text-sm text-muted-foreground">
                  Carregando mais livros...
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
