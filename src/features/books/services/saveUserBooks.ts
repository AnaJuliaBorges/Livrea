import { supabase } from "@/lib/supabase";
import type { Book } from "../types/book";

export type LibraryStatus = "read" | "want_to_read";

function toBookPayload(book: Book) {
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
    categories: [book.genre.main, ...(book.genre.secondary ?? [])].filter(
      Boolean,
    ),
    secondary_categories: book.genre.secondary ?? [],
    average_rating: book.averageRating ?? null,
    ratings_count: book.ratingsCount ?? null,
  };
}

export async function saveUserBooks(books: Book[], status: LibraryStatus) {
  // books.isbn é NOT NULL UNIQUE no banco — livros sem ISBN não podem ser salvos
  const payload = books.filter((book) => book.info.isbn).map(toBookPayload);

  if (payload.length === 0) return;

  const { error } = await supabase.rpc("save_user_books", {
    p_books: payload,
    p_status: status,
  });

  if (error) throw error;
}
