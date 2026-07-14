import type {
  IsbndbBook,
  IsbndbBookResponse,
  IsbndbResponse,
} from "../types/isbndb";

const ISBNDB_API_KEY = import.meta.env.VITE_ISBNDB_API_KEY;
const ISBNDB_BASE_URL = "https://api2.isbndb.com";

export async function searchIsbndbByGenre(
  genre: string,
  pageSize: number = 20,
  page: number = 1,
): Promise<IsbndbBook[]> {
  if (!ISBNDB_API_KEY) {
    throw new Error("VITE_ISBNDB_API_KEY não configurada");
  }

  const url = new URL(
    `${ISBNDB_BASE_URL}/subject/${encodeURIComponent(genre)}`,
  );
  url.searchParams.append("language", "pt-br");
  url.searchParams.append("pageSize", pageSize.toString());
  url.searchParams.append("page", page.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: ISBNDB_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar livros na ISBNDB: ${response.statusText}`);
  }

  const data: IsbndbResponse = await response.json();
  return data.books ?? [];
}

// Endpoint de livro único — o mais completo da ISBNDB (traz synopsis
// e subjects, que a busca não retorna)
export async function getIsbndbBookByIsbn(
  isbn: string,
): Promise<IsbndbBook | null> {
  if (!ISBNDB_API_KEY) {
    throw new Error("VITE_ISBNDB_API_KEY não configurada");
  }

  const response = await fetch(
    `${ISBNDB_BASE_URL}/book/${encodeURIComponent(isbn)}`,
    {
      headers: {
        Authorization: ISBNDB_API_KEY,
      },
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Erro ao buscar livro na ISBNDB: ${response.statusText}`);
  }

  const data: IsbndbBookResponse = await response.json();
  return data.book ?? null;
}

export async function searchIsbndbByQuery(
  query: string,
  pageSize: number = 20,
  page: number = 1,
): Promise<IsbndbBook[]> {
  if (!ISBNDB_API_KEY) {
    throw new Error("VITE_ISBNDB_API_KEY não configurada");
  }

  const url = new URL(`${ISBNDB_BASE_URL}/books/${encodeURIComponent(query)}`);
  url.searchParams.append("shouldMatchAll", "false");
  url.searchParams.append("language", "por");
  url.searchParams.append("pageSize", pageSize.toString());
  url.searchParams.append("page", page.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: ISBNDB_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar livros na ISBNDB: ${response.statusText}`);
  }

  const data: IsbndbResponse = await response.json();
  return data.books ?? [];
}
