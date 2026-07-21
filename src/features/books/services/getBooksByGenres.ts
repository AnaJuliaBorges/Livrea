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

  // A RLS de `books` bloqueia SELECT direto do client (mesmo motivo de
  // get_book/search_books), então a recomendação vem de uma RPC
  // SECURITY DEFINER que faz a cascata em SQL: junção book_genres (gênero
  // primário + secundários) → primary_genre_id → todos os livros do banco
  // quando nada casa com os gêneros do usuário.
  const { data, error } = await supabase.rpc("get_books_by_genres", {
    p_genre_ids: genreIds,
  });

  if (error) throw new Error(error.message);

  return ((data ?? []) as RawRow[]).map(mapRow);
}
