import { getIsbndbBookByIsbn } from "../api/isbndb";
import { mapIsbndb } from "./mapIsbndb";
import type { Book } from "../types/book";

export async function fetchIsbndbBookData(isbn: string): Promise<Book | null> {
  const item = await getIsbndbBookByIsbn(isbn);
  return item ? mapIsbndb(item) : null;
}
