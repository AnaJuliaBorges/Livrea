import { useBook } from "@/features/books/hooks/useBook";
import { BookRatingBox } from "./BookRatingBox";
import { BookReadingCard } from "./BookReadingCard";

// Card do histórico completo (capa/dados + avaliação), pra cada leitura
// passada do clube.
export function PastReadingItem({
  clubId,
  bookId,
  isMember,
  onSelectTab,
}: {
  clubId: string;
  bookId: string;
  isMember: boolean;
  onSelectTab: (tab: string) => void;
}) {
  const { data: book } = useBook(bookId);

  return (
    <div className="flex flex-col gap-2">
      <BookReadingCard bookId={bookId} />
      {isMember && (
        <BookRatingBox
          book={book}
          clubId={clubId}
          bookId={bookId}
          onSelectTab={onSelectTab}
          text="dos participantes leram o livro"
        />
      )}
    </div>
  );
}
