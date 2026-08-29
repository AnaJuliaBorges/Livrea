import {
  getGoogleBookById,
  searchGoogleBooksByISBN,
} from "../api/googleBooks";
import { mapGoogleBook } from "./mapGoogleBook";
import type { Book } from "../types/book";

export function mergeBook(book: Book, extra: Book): Book {
  return {
    ...book,
    info: {
      isbn: book.info.isbn ?? extra.info.isbn,
      title: book.info.title || extra.info.title,
      subtitle: book.info.subtitle || extra.info.subtitle,
      authors: book.info.authors.length
        ? book.info.authors
        : extra.info.authors,
      summary: book.info.summary ?? extra.info.summary,
      pageCount: book.info.pageCount ?? extra.info.pageCount,
    },
    genre: {
      main: book.genre.main ?? extra.genre.main,
      secondary: book.genre.secondary?.length
        ? book.genre.secondary
        : extra.genre.secondary,
    },
    publisher: {
      publisher: book.publisher.publisher || extra.publisher.publisher,
      publisherDate:
        book.publisher.publisherDate || extra.publisher.publisherDate,
    },
    image: {
      smallThumbnail: book.image.smallThumbnail ?? extra.image.smallThumbnail,
      thumbnail: book.image.thumbnail ?? extra.image.thumbnail,
      medium: book.image.medium ?? extra.image.medium,
      large: book.image.large ?? extra.image.large,
    },
    averageRating: book.averageRating ?? extra.averageRating,
    ratingsCount: book.ratingsCount ?? extra.ratingsCount,
  };
}

export async function fetchGoogleBookData(
  isbn?: string,
  googleId?: string,
): Promise<Book | null> {
  const item = isbn
    ? ((await searchGoogleBooksByISBN(isbn))[0] ?? null)
    : googleId
      ? await getGoogleBookById(googleId)
      : null;

  if (!item) return null;

  let data = mapGoogleBook(item);

  const detail = item.id ? await getGoogleBookById(item.id) : null;
  if (detail) {
    data = mergeBook(mapGoogleBook(detail), data);
  }

  return data;
}
