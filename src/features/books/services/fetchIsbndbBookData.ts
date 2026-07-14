import { getIsbndbBookByIsbn } from "../api/isbndb";
import { mapIsbndb } from "./mapIsbndb";
import type { Book } from "../types/book";

// Busca o registro completo de um livro na ISBNDB (o endpoint /book/{isbn}
// traz sinopse e subjects, que a busca não retorna).
export async function fetchIsbndbBookData(isbn: string): Promise<Book | null> {
  const item = await getIsbndbBookByIsbn(isbn);
  return item ? mapIsbndb(item) : null;
}
