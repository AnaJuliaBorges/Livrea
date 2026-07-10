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
      summary: undefined,
    },
    genre: {
      main: undefined,
      secondary: [],
    },
    publisher: {
      publisherDate: item.date_published || "",
      publisher: item.publisher || "",
    },
    image: {
      // ISBNDB fornece uma única imagem; medium/large ficam vazios
      // para o enriquecimento via Google Books poder preenchê-los
      smallThumbnail: item.image,
      thumbnail: item.image,
      medium: undefined,
      large: undefined,
    },
    averageRating: undefined,
    ratingsCount: undefined,
  };
}
