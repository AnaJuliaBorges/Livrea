import { describe, it, expect, vi, beforeEach } from "vitest";
import { upsertBook } from "./upsertBook";
import { supabase } from "@/lib/supabase";
import type { Book } from "../types/book";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const book: Book = {
  google_id: "abc123",
  info: {
    isbn: "9788595084742",
    title: "O Hobbit",
    subtitle: "",
    authors: ["J. R. R. Tolkien"],
  },
  genre: {},
  publisher: { publisher: "HarperCollins", publisherDate: "2019" },
  image: {
    thumbnail: "https://covers.example.com/thumb.jpg",
    smallThumbnail: "https://covers.example.com/small.jpg",
  },
};

describe("upsertBook", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    rpcMock.mockResolvedValue(rpcResult("book-uuid-1"));
  });

  it("chama a RPC upsert_book com os dados mínimos do livro", async () => {
    const id = await upsertBook(book);

    expect(rpcMock).toHaveBeenCalledWith("upsert_book", {
      p_isbn: "9788595084742",
      p_title: "O Hobbit",
      p_authors: ["J. R. R. Tolkien"],
      p_image_thumbnail: "https://covers.example.com/thumb.jpg",
      p_image_small_thumbnail: "https://covers.example.com/small.jpg",
    });
    expect(id).toBe("book-uuid-1");
  });

  it("envia null para imagens ausentes", async () => {
    await upsertBook({ ...book, image: {} });

    expect(rpcMock).toHaveBeenCalledWith(
      "upsert_book",
      expect.objectContaining({
        p_image_thumbnail: null,
        p_image_small_thumbnail: null,
      }),
    );
  });

  it("rejeita livro sem ISBN sem chamar a RPC", async () => {
    await expect(
      upsertBook({ ...book, info: { ...book.info, isbn: undefined } }),
    ).rejects.toThrow("Livro sem ISBN");
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("lança o erro retornado pela RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("RPC não existe")));

    await expect(upsertBook(book)).rejects.toThrow("RPC não existe");
  });

  it("envia array vazio quando não há autores", async () => {
    await upsertBook({ ...book, info: { ...book.info, authors: undefined as unknown as string[] } });

    expect(rpcMock).toHaveBeenCalledWith(
      "upsert_book",
      expect.objectContaining({ p_authors: [] }),
    );
  });

  it("lança erro quando a RPC não retorna dado", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    await expect(upsertBook(book)).rejects.toThrow(
      "Não foi possível salvar o livro",
    );
  });
});
