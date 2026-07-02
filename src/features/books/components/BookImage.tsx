import { useState } from "react";
import placeholderBook from "../../../assets/book-placeholder.png";
import type { BookTemp } from "../types/book";

export function BookImage({
  book,
  height,
}: {
  book: BookTemp;
  height?: string;
}) {
  const [imgSrc, setImgSrc] = useState(
    book.image_medium ||
      book.image_thumbnail ||
      book.image_large ||
      placeholderBook,
  );

  return (
    <img
      src={imgSrc}
      alt={book.title_original}
      className={`w-full ${height ?? "aspect-2/3"} overflow-hidden rounded-md bg-muted`}
      onError={() => {
        setImgSrc(placeholderBook);
      }}
    />
  );
}
