import { supabase } from "@/lib/supabase";
import type { Book } from "../types/book";

// Garante que um livro da busca externa exista no banco e retorna o id.
// Só grava o mínimo (isbn/título/autores/capa) — a página de detalhes
// completa o restante via complete_book_data.
export async function upsertBook(book: Book): Promise<string> {
  if (!book.info.isbn) {
    throw new Error("Livro sem ISBN não pode ser salvo");
  }

  const { data, error } = await supabase.rpc("upsert_book", {
    p_isbn: book.info.isbn,
    p_title: book.info.title,
    p_authors: book.info.authors ?? [],
    p_image_thumbnail: book.image.thumbnail ?? null,
    p_image_small_thumbnail: book.image.smallThumbnail ?? null,
  });

  if (error) throw error;
  if (!data) throw new Error("Não foi possível salvar o livro");

  return data as string;
}
