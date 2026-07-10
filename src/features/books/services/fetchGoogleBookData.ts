import {
  getGoogleBookById,
  searchGoogleBooksByISBN,
} from "../api/googleBooks";
import { mapGoogleBook } from "./mapGoogleBook";
import type { Book } from "../types/book";

// Mescla dois Books: `book` manda, `extra` só preenche lacunas.
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

// Busca os dados de um livro no Google Books: por ISBN quando houver
// (caminho confiável — livros do ISBNDB têm google_id = isbn) ou pelo
// volume id. Depois puxa o endpoint de detalhe, único que traz as
// imagens medium/large.
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

  // o detalhe é o registro mais completo (categorias BISAC reais,
  // imagens medium/large) — ele manda; o item da busca só complementa
  const detail = item.id ? await getGoogleBookById(item.id) : null;
  if (detail) {
    data = mergeBook(mapGoogleBook(detail), data);
  }

  return data;
}
