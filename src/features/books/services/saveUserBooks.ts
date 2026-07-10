import { supabase } from "@/lib/supabase";
import { fetchGoogleBookData, mergeBook } from "./fetchGoogleBookData";
import type { Book } from "../types/book";

export type LibraryStatus = "read" | "want_to_read";

// ISBNDB é a fonte principal (é dela que vem a busca); o Google Books
// só preenche o que faltar: sinopse, subtítulo, categorias (que viram
// gêneros no banco), páginas, notas e imagens em alta resolução.
async function enrichBook(book: Book): Promise<Book> {
  const googleData = await fetchGoogleBookData(
    book.info.isbn,
    book.google_id,
  ).catch(() => null);

  return googleData ? mergeBook(book, googleData) : book;
}

// evita estourar rate limit do Google com muitos livros selecionados
async function enrichInChunks(books: Book[], chunkSize = 5): Promise<Book[]> {
  const enriched: Book[] = [];

  for (let i = 0; i < books.length; i += chunkSize) {
    const chunk = books.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(enrichBook));
    enriched.push(...results);
  }

  return enriched;
}

export function toBookPayload(book: Book) {
  return {
    isbn: book.info.isbn,
    title: book.info.title,
    subtitle: book.info.subtitle,
    authors: book.info.authors,
    synopsis: book.info.summary ?? null,
    publisher: book.publisher.publisher,
    publisher_date: book.publisher.publisherDate,
    total_pages: book.info.pageCount ?? 0,
    image_small_thumbnail: book.image.smallThumbnail ?? null,
    image_thumbnail: book.image.thumbnail ?? null,
    image_medium: book.image.medium ?? null,
    image_large: book.image.large ?? null,
    // a RPC reparte: o que casa com a tabela genres vira gênero,
    // o restante vira subjects
    categories: [book.genre.main, ...(book.genre.secondary ?? [])].filter(
      Boolean,
    ),
    average_rating: book.averageRating ?? null,
    ratings_count: book.ratingsCount ?? null,
  };
}

export async function saveUserBooks(books: Book[], status: LibraryStatus) {
  const enriched = await enrichInChunks(books);

  // books.isbn é NOT NULL UNIQUE no banco — livros sem ISBN não podem ser salvos
  const payload = enriched.filter((book) => book.info.isbn).map(toBookPayload);

  if (payload.length === 0) return;

  const { error } = await supabase.rpc("save_user_books", {
    p_books: payload,
    p_status: status,
  });

  if (error) throw error;
}
