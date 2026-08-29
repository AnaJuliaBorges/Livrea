import { ContainerBorder } from "@/components/shared/ContainerBorder";
import { BookImage } from "@/features/books";
import { useBook } from "@/features/books";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BookReadingCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate();
  const { data: book, isLoading } = useBook(bookId);

  if (isLoading) {
    return (
      <ContainerBorder className="items-center text-xs text-muted-foreground">
        Carregando livro...
      </ContainerBorder>
    );
  }

  return (
    <div onClick={() => navigate(`/livros/${bookId}`)}>
      <ContainerBorder className="flex-row items-center gap-3">
        <BookImage
          book={book}
          height="h-28"
          className="w-20 shrink-0 object-cover"
        />
        <div className="text-xs flex-1 min-w-0">
          <p className="font-medium">
            {book?.title_pt ?? book?.title_original}
          </p>
          <p>{book?.authors.join(", ")}</p>
          <p>{book?.publisher}</p>
          <p>{book?.primary_genre?.name}</p>
          {Boolean(book?.total_pages) && <p>{book?.total_pages} páginas</p>}
        </div>
        <ChevronRight className="shrink-0" />
      </ContainerBorder>
    </div>
  );
}
