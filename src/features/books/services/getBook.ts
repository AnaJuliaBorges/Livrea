import { supabase } from "@/lib/supabase";
import { fetchGoogleBookData } from "./fetchGoogleBookData";
import { fetchIsbndbBookData } from "./fetchIsbndbBookData";
import type { Book, BookTemp } from "../types/book";

type RawBookRow = {
  id: string;
  isbn: string;
  title_original: string;
  title_pt: string | null;
  subtitle: string | null;
  authors: string[];
  synopsis: string | null;
  publisher: string | null;
  publisher_date: string | null;
  total_pages: number | null;
  image_small_thumbnail: string | null;
  image_thumbnail: string | null;
  image_medium: string | null;
  image_large: string | null;
  global_average_rating: number | null;
  global_count_rating: number | null;
  local_average_rating: number | null;
  local_count_rating: number | null;
  secondary_genre: string[] | null;
  subjects: string[] | null;
  primary_genre: { id: number; name: string } | null;
};

function mapRow(row: RawBookRow): BookTemp {
  return {
    id: row.id,
    isbn: row.isbn,
    title_original: row.title_original,
    title_pt: row.title_pt,
    subtitle: row.subtitle,
    authors: row.authors ?? [],
    synopsis: row.synopsis,
    publisher: row.publisher,
    publisher_date: row.publisher_date,
    total_pages: row.total_pages ?? 0,
    image_thumbnail: row.image_thumbnail ?? undefined,
    image_medium: row.image_medium ?? undefined,
    image_large: row.image_large ?? undefined,
    primary_genre: row.primary_genre ?? undefined,
    secondary_genres: row.secondary_genre ?? [],
    subjects: row.subjects ?? [],
    global_average_rating: row.global_average_rating ?? undefined,
    global_count_rating: row.global_count_rating ?? undefined,
    local_average_rating: row.local_average_rating ?? undefined,
    local_count_rating: row.local_count_rating ?? undefined,
  };
}

async function fetchBookRow(id: string): Promise<RawBookRow> {
  const { data, error } = await supabase.rpc("get_book", { p_book_id: id });

  if (error) throw error;
  if (!data) throw new Error("Livro não encontrado");

  return data as RawBookRow;
}

function isIncomplete(row: RawBookRow) {
  return (
    !row.synopsis ||
    !row.image_medium ||
    !row.total_pages ||
    !row.primary_genre
  );
}

function buildPatch(book: Book) {
  return {
    subtitle: book.info.subtitle || null,
    synopsis: book.info.summary ?? null,
    publisher: book.publisher.publisher || null,
    publisher_date: book.publisher.publisherDate || null,
    total_pages: book.info.pageCount ?? null,
    image_small_thumbnail: book.image.smallThumbnail ?? null,
    image_thumbnail: book.image.thumbnail ?? null,
    image_medium: book.image.medium ?? null,
    image_large: book.image.large ?? null,
    average_rating: book.averageRating ?? null,
    ratings_count: book.ratingsCount ?? null,
    categories: [book.genre.main, ...(book.genre.secondary ?? [])].filter(
      Boolean,
    ),
  };
}

async function applyPatch(bookId: string, patch: ReturnType<typeof buildPatch>) {
  const { error } = await supabase.rpc("complete_book_data", {
    p_book_id: bookId,
    p_data: patch,
  });

  if (error) throw error;
}

async function enrichFromIsbndb(row: RawBookRow): Promise<RawBookRow> {
  const isbndb = await fetchIsbndbBookData(row.isbn).catch(() => null);
  if (!isbndb) return row;

  try {
    await applyPatch(row.id, buildPatch(isbndb));
  } catch (error) {
    console.error("Erro ao completar dados do livro (ISBNDB):", error);
    return row;
  }

  return fetchBookRow(row.id);
}

export async function getBook(id: string): Promise<BookTemp> {
  let row = await fetchBookRow(id);

  if (isIncomplete(row) && row.isbn) {
    row = await enrichFromIsbndb(row);
  }

  return mapRow(row);
}

export function needsGoogleEnrichment(book: BookTemp) {
  return (
    !!book.isbn &&
    (!book.synopsis ||
      !book.image_medium ||
      !book.total_pages ||
      !book.primary_genre)
  );
}

export async function enrichBookWithGoogle(book: BookTemp): Promise<boolean> {
  const google = await fetchGoogleBookData(book.isbn).catch(() => null);
  if (!google) return false;

  await applyPatch(book.id, buildPatch(google));
  return true;
}
