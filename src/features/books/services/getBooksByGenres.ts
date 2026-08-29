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

  const { data, error } = await supabase.rpc("get_books_by_genres", {
    p_genre_ids: genreIds,
  });

  if (error) throw new Error(error.message);

  return ((data ?? []) as RawRow[]).map(mapRow);
}
