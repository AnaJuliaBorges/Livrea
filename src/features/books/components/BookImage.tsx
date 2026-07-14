import { useState } from "react";
import placeholderBook from "../../../assets/book-placeholder.png";

type BookImageData = {
  title_original: string;
  image_thumbnail?: string | null;
  image_medium?: string | null;
  image_large?: string | null;
};

export function BookImage({
  book,
  height,
}: {
  book?: BookImageData;
  height?: string;
}) {
  const [imgSrc, setImgSrc] = useState(
    book?.image_medium ||
      book?.image_thumbnail ||
      book?.image_large ||
      placeholderBook,
  );

  return (
    <img
      src={imgSrc}
      alt={book?.title_original ?? "Capa do livro"}
      className={`w-auto ${height ?? "aspect-2/3"} overflow-hidden rounded-md bg-muted`}
      onError={() => {
        setImgSrc(placeholderBook);
      }}
    />
  );
}
