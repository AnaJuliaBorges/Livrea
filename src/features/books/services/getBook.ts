import { supabase } from "@/lib/supabase";
import { fetchGoogleBookData } from "./fetchGoogleBookData";
import type { BookTemp } from "../types/book";

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

// Ao abrir um livro incompleto, busca os dados no Google Books pelo
// ISBN e completa os campos nulos no banco (complete_book_data nunca
// sobrescreve dado existente). Falha do Google não bloqueia a página.
async function enrichBookRow(row: RawBookRow): Promise<RawBookRow> {
  const google = await fetchGoogleBookData(row.isbn).catch(() => null);
  if (!google) return row;

  const patch = {
    subtitle: google.info.subtitle || null,
    synopsis: google.info.summary ?? null,
    publisher: google.publisher.publisher || null,
    publisher_date: google.publisher.publisherDate || null,
    total_pages: google.info.pageCount ?? null,
    image_small_thumbnail: google.image.smallThumbnail ?? null,
    image_thumbnail: google.image.thumbnail ?? null,
    image_medium: google.image.medium ?? null,
    image_large: google.image.large ?? null,
    average_rating: google.averageRating ?? null,
    ratings_count: google.ratingsCount ?? null,
    categories: [google.genre.main, ...(google.genre.secondary ?? [])].filter(
      Boolean,
    ),
  };

  const { error } = await supabase.rpc("complete_book_data", {
    p_book_id: row.id,
    p_data: patch,
  });

  if (error) {
    console.error("Erro ao completar dados do livro:", error);
    return row;
  }

  // relê para pegar o registro completo (inclusive o gênero resolvido)
  return fetchBookRow(row.id);
}

export async function getBook(id: string): Promise<BookTemp> {
  let row = await fetchBookRow(id);

  if (isIncomplete(row) && row.isbn) {
    row = await enrichBookRow(row);
  }

  return mapRow(row);
}
