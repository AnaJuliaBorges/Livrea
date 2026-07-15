import { supabase } from "@/lib/supabase";
import { searchGoogleBooks } from "@/features/books/api/googleBooks";
import { searchIsbndbByQuery } from "@/features/books/api/isbndb";
import { mapGoogleBook } from "@/features/books/services/mapGoogleBook";
import { mapIsbndb } from "@/features/books/services/mapIsbndb";
import type { Book } from "@/features/books/types/book";

// Resultado unificado da busca do modal "definir leitura do clube".
// Livros do banco já têm id; externos precisam de upsert_book antes de usar.
export type ClubReadingSearchResult = {
  key: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  source: "db" | "external";
  bookId?: string;
  externalBook?: Book;
};

type RawDbBook = {
  id: string;
  title: string;
  authors: string[] | null;
  image_thumbnail: string | null;
};

async function searchDb(query: string): Promise<ClubReadingSearchResult[]> {
  const { data, error } = await supabase.rpc("search_books", {
    p_query: query,
    p_limit: 10,
  });

  if (error) throw error;

  return ((data ?? []) as RawDbBook[]).map((book) => ({
    key: `db-${book.id}`,
    title: book.title,
    authors: book.authors ?? [],
    thumbnail: book.image_thumbnail,
    source: "db" as const,
    bookId: book.id,
  }));
}

// Externos sem ISBN não podem ser salvos no banco (books.isbn é NOT NULL
// UNIQUE), então nem aparecem como opção
function mapExternal(books: Book[]): ClubReadingSearchResult[] {
  return books
    .filter((book) => book.info.isbn)
    .map((book) => ({
      key: `ext-${book.info.isbn}`,
      title: book.info.title,
      authors: book.info.authors ?? [],
      thumbnail: book.image.thumbnail ?? book.image.smallThumbnail ?? null,
      source: "external" as const,
      externalBook: book,
    }));
}

// Busca em cascata: banco primeiro, depois ISBNDB e por fim Google Books —
// para na primeira fonte que retornar resultados.
export async function searchClubReadingBooks(
  query: string,
): Promise<ClubReadingSearchResult[]> {
  const dbResults = await searchDb(query);
  if (dbResults.length > 0) return dbResults;

  try {
    const isbndbBooks = await searchIsbndbByQuery(query, 10, 1);
    const results = mapExternal(isbndbBooks.map(mapIsbndb));
    if (results.length > 0) return results;
  } catch (error) {
    console.error("Erro na busca ISBNDB, tentando Google:", error);
  }

  const googleItems = await searchGoogleBooks(query);
  return mapExternal(googleItems.map(mapGoogleBook)).slice(0, 10);
}
