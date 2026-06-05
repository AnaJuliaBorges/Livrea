import type { Book } from "../types/book";

interface Props {
  book: Book;
  selected: boolean;
  onToggle: (book: Book) => void;
}

export function BookCard({ book, selected, onToggle }: Props) {
  const bookImage = book.image.thumbnail || book.image.smallThumbnail;
  return (
    <button
      type="button"
      onClick={() => onToggle(book)}
      className="relative w-full aspect-2/3 rounded-lg overflow-hidden group cursor-pointer border-2 transition-border bg-transparent hover:opacity-90"
      style={{ borderColor: selected ? "#3b82f6" : "#e5e7eb" }}
    >
      {bookImage ? (
        <img
          src={bookImage}
          alt={book.info.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm text-center px-2">
            Sem imagem
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/20  transition-opacity duration-300 flex items-end p-3">
        <div className="bg-black/60 backdrop-blur-sm rounded-md p-2 w-full">
          <h3 className="text-white text-[10px] font-semibold line-clamp-2">
            {book.info.title}
          </h3>
        </div>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
          ✓
        </div>
      )}
    </button>
  );
}
