import { supabase } from "@/lib/supabase";
import { searchGoogleBooks } from "@/features/books";
import { searchIsbndbByQuery } from "@/features/books";
import { mapGoogleBook } from "@/features/books";
import { mapIsbndb } from "@/features/books";
import type { Book } from "@/features/books";

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

// Chave título+autores normalizada (sem acento, minúscula) pra achar o
// mesmo livro em fontes diferentes, que não compartilham nenhum id.
function dedupeKey(title: string, authors: string[]): string {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .trim()
      .toLowerCase();

  return `${normalize(title)}|${authors.map(normalize).sort().join(",")}`;
}

// Banco e ISBNDB são buscados em paralelo e combinados (com prioridade pro
// banco em caso de duplicata); Google Books só entra se essa combinação não
// retornar nada.
export async function searchClubReadingBooks(
  query: string,
): Promise<ClubReadingSearchResult[]> {
  const [dbResults, isbndbResults] = await Promise.all([
    searchDb(query),
    searchIsbndbByQuery(query, 10, 1)
      .then((books) => mapExternal(books.map(mapIsbndb)))
      .catch((error) => {
        console.error("Erro na busca ISBNDB, seguindo com banco/Google:", error);
        return [] as ClubReadingSearchResult[];
      }),
  ]);

  const dbKeys = new Set(
    dbResults.map((book) => dedupeKey(book.title, book.authors)),
  );
  const newIsbndbResults = isbndbResults.filter(
    (book) => !dbKeys.has(dedupeKey(book.title, book.authors)),
  );

  const combined = [...dbResults, ...newIsbndbResults];
  if (combined.length > 0) return combined;

  const googleItems = await searchGoogleBooks(query);
  return mapExternal(googleItems.map(mapGoogleBook)).slice(0, 10);
}
