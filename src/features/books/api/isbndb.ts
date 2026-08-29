import { supabase } from "@/lib/supabase";
import type {
  IsbndbBook,
  IsbndbBookResponse,
  IsbndbResponse,
} from "../types/isbndb";

async function invokeIsbndb<T>(
  body: {
    action: "books" | "subject" | "book";
    term: string;
    pageSize?: number;
    page?: number;
  },
  errorMessage: string,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("isbndb", { body });

  if (error) throw new Error(errorMessage);

  return data as T;
}

export async function searchIsbndbByGenre(
  genre: string,
  pageSize: number = 20,
  page: number = 1,
): Promise<IsbndbBook[]> {
  const data = await invokeIsbndb<IsbndbResponse>(
    { action: "subject", term: genre, pageSize, page },
    "Erro ao buscar livros na ISBNDB",
  );

  return data.books ?? [];
}

export async function getIsbndbBookByIsbn(
  isbn: string,
): Promise<IsbndbBook | null> {
  const data = await invokeIsbndb<IsbndbBookResponse>(
    { action: "book", term: isbn },
    "Erro ao buscar livro na ISBNDB",
  );

  return data.book ?? null;
}

export async function searchIsbndbByQuery(
  query: string,
  pageSize: number = 20,
  page: number = 1,
): Promise<IsbndbBook[]> {
  const data = await invokeIsbndb<IsbndbResponse>(
    { action: "books", term: query, pageSize, page },
    "Erro ao buscar livros na ISBNDB",
  );

  return data.books ?? [];
}
