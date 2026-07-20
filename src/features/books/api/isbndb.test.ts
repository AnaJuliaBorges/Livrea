import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import {
  searchIsbndbByGenre,
  getIsbndbBookByIsbn,
  searchIsbndbByQuery,
} from "./isbndb";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const invokeMock = vi.mocked(supabase.functions.invoke);

function invokeResult(data: unknown, error: unknown = null) {
  return { data, error } as Awaited<
    ReturnType<typeof supabase.functions.invoke>
  >;
}

beforeEach(() => {
  invokeMock.mockReset();
});

describe("searchIsbndbByGenre", () => {
  it("chama a Edge Function com action subject e retorna os livros", async () => {
    invokeMock.mockResolvedValue(
      invokeResult({ books: [{ isbn: "1", isbn13: "1", title: "Livro" }] }),
    );

    const result = await searchIsbndbByGenre("Fantasy");

    expect(invokeMock).toHaveBeenCalledWith("isbndb", {
      body: { action: "subject", term: "Fantasy", pageSize: 20, page: 1 },
    });
    expect(result).toEqual([{ isbn: "1", isbn13: "1", title: "Livro" }]);
  });

  it("retorna array vazio quando a resposta não tem books", async () => {
    invokeMock.mockResolvedValue(invokeResult({}));

    expect(await searchIsbndbByGenre("Fantasy")).toEqual([]);
  });

  it("lança erro quando a function falha", async () => {
    invokeMock.mockResolvedValue(invokeResult(null, new Error("boom")));

    await expect(searchIsbndbByGenre("Fantasy")).rejects.toThrow(
      "Erro ao buscar livros na ISBNDB",
    );
  });
});

describe("getIsbndbBookByIsbn", () => {
  it("chama a Edge Function com action book e retorna o livro", async () => {
    invokeMock.mockResolvedValue(
      invokeResult({ book: { isbn: "1", isbn13: "1", title: "Livro" } }),
    );

    const result = await getIsbndbBookByIsbn("1");

    expect(invokeMock).toHaveBeenCalledWith("isbndb", {
      body: { action: "book", term: "1" },
    });
    expect(result).toEqual({ isbn: "1", isbn13: "1", title: "Livro" });
  });

  it("retorna null quando o livro não existe (book null)", async () => {
    invokeMock.mockResolvedValue(invokeResult({ book: null }));

    expect(await getIsbndbBookByIsbn("1")).toBeNull();
  });

  it("lança erro quando a function falha", async () => {
    invokeMock.mockResolvedValue(invokeResult(null, new Error("boom")));

    await expect(getIsbndbBookByIsbn("1")).rejects.toThrow(
      "Erro ao buscar livro na ISBNDB",
    );
  });
});

describe("searchIsbndbByQuery", () => {
  it("chama a Edge Function com action books e retorna os livros", async () => {
    invokeMock.mockResolvedValue(
      invokeResult({ books: [{ isbn: "1", isbn13: "1", title: "Livro" }] }),
    );

    const result = await searchIsbndbByQuery("duna", 10, 2);

    expect(invokeMock).toHaveBeenCalledWith("isbndb", {
      body: { action: "books", term: "duna", pageSize: 10, page: 2 },
    });
    expect(result).toEqual([{ isbn: "1", isbn13: "1", title: "Livro" }]);
  });

  it("retorna array vazio quando a resposta não tem books", async () => {
    invokeMock.mockResolvedValue(invokeResult({}));

    expect(await searchIsbndbByQuery("duna")).toEqual([]);
  });

  it("lança erro quando a function falha", async () => {
    invokeMock.mockResolvedValue(invokeResult(null, new Error("boom")));

    await expect(searchIsbndbByQuery("duna")).rejects.toThrow(
      "Erro ao buscar livros na ISBNDB",
    );
  });
});
