import { supabase } from "@/lib/supabase";

export type GenreBook = {
  id: string;
  isbn: string;
  title: string;
  image?: string;
};

type RawRow = {
  id: string;
  isbn: string;
  title_original: string;
  title_pt: string | null;
  image_thumbnail: string | null;
  image_medium: string | null;
};

const SELECT_COLUMNS =
  "id, isbn, title_original, title_pt, image_thumbnail, image_medium";

function mapRow(row: RawRow): GenreBook {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.title_pt ?? row.title_original,
    image: row.image_thumbnail ?? row.image_medium ?? undefined,
  };
}

export async function getBooksByGenres(
  genreIds: number[],
): Promise<GenreBook[]> {
  if (genreIds.length === 0) return [];

  // book_genres cobre gênero primário e secundários; se a junção não
  // tiver linhas para esses livros, cai no primary_genre_id direto
  const { data, error } = await supabase
    .from("books")
    .select(`${SELECT_COLUMNS}, book_genres!inner(genre_id)`)
    .in("book_genres.genre_id", genreIds)
    .order("global_average_rating", { ascending: false, nullsFirst: false })
    .limit(40);

  if (error) throw new Error(error.message);

  if (data && data.length > 0) return (data as RawRow[]).map(mapRow);

  const fallback = await supabase
    .from("books")
    .select(SELECT_COLUMNS)
    .in("primary_genre_id", genreIds)
    .order("global_average_rating", { ascending: false, nullsFirst: false })
    .limit(40);

  if (fallback.error) throw new Error(fallback.error.message);

  return ((fallback.data ?? []) as RawRow[]).map(mapRow);
}
