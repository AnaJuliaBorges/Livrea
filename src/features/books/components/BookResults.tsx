import { useEffect, useRef } from "react";
import type { Book } from "../types/book";
import { BookCard } from "./BookCard";

interface BookResultsProps {
  books: Book[];
  selectedIds: Set<string>;
  onToggle: (book: Book) => void;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function BookResults({
  books,
  selectedIds,
  onToggle,
  isLoading,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: BookResultsProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!endRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(endRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (books.length === 0 && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Procurando livros...</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Nenhum livro encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 w-full">
        {books.map((book) => (
          <BookCard
            key={book.google_id}
            book={book}
            selected={selectedIds.has(book.google_id)}
            onToggle={onToggle}
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
    </div>
  );
}
