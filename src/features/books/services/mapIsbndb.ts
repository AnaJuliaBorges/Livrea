import type { Book } from "../types/book";
import type { IsbndbBook } from "../types/isbndb";

export function mapIsbndb(item: IsbndbBook): Book {
  const authors = item.authors
    ? item.authors
    : item.author
      ? [item.author]
      : [];

  return {
    google_id: item.isbn13 || item.isbn,
    info: {
      isbn: item.isbn13 || item.isbn,
      title: item.title || "Sem título",
      subtitle: "",
      authors,
      pageCount: item.pages,
      summary: item.synopsis,
    },
    genre: {
      main: undefined,
      secondary: item.subjects ?? [],
    },
    publisher: {
      publisherDate: item.date_published || "",
      publisher: item.publisher || "",
    },
    image: {
      smallThumbnail: item.image,
      thumbnail: item.image,
      medium: undefined,
      large: undefined,
    },
    averageRating: undefined,
    ratingsCount: undefined,
  };
}
