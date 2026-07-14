import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  searchIsbndbByGenre,
  getIsbndbBookByIsbn,
  searchIsbndbByQuery,
} from "./isbndb";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: "Erro",
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const fetchMock = () => vi.mocked(fetch);

describe("searchIsbndbByGenre", () => {
  it("retorna os livros da resposta", async () => {
    fetchMock().mockResolvedValue(
      jsonResponse({ books: [{ isbn: "1", isbn13: "1", title: "Livro" }] }),
    );

    const result = await searchIsbndbByGenre("Fantasy");

    expect(result).toEqual([{ isbn: "1", isbn13: "1", title: "Livro" }]);
  });

  it("retorna array vazio quando a resposta não tem books", async () => {
    fetchMock().mockResolvedValue(jsonResponse({}));

    expect(await searchIsbndbByGenre("Fantasy")).toEqual([]);
  });

  it("lança erro quando a resposta não é ok", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false));

    await expect(searchIsbndbByGenre("Fantasy")).rejects.toThrow(
      "Erro ao buscar livros na ISBNDB",
    );
  });
});

describe("getIsbndbBookByIsbn", () => {
  it("retorna o livro da resposta", async () => {
    fetchMock().mockResolvedValue(
      jsonResponse({ book: { isbn: "1", isbn13: "1", title: "Livro" } }),
    );

    expect(await getIsbndbBookByIsbn("1")).toEqual({
      isbn: "1",
      isbn13: "1",
      title: "Livro",
    });
  });

  it("retorna null quando a resposta não tem book", async () => {
    fetchMock().mockResolvedValue(jsonResponse({}));

    expect(await getIsbndbBookByIsbn("1")).toBeNull();
  });

  it("retorna null em 404", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false, 404));

    expect(await getIsbndbBookByIsbn("1")).toBeNull();
  });

  it("lança erro quando a resposta não é ok e não é 404", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false, 500));

    await expect(getIsbndbBookByIsbn("1")).rejects.toThrow(
      "Erro ao buscar livro na ISBNDB",
    );
  });
});

describe("searchIsbndbByQuery", () => {
  it("retorna os livros da resposta", async () => {
    fetchMock().mockResolvedValue(
      jsonResponse({ books: [{ isbn: "1", isbn13: "1", title: "Livro" }] }),
    );

    expect(await searchIsbndbByQuery("duna")).toEqual([
      { isbn: "1", isbn13: "1", title: "Livro" },
    ]);
  });

  it("retorna array vazio quando a resposta não tem books", async () => {
    fetchMock().mockResolvedValue(jsonResponse({}));

    expect(await searchIsbndbByQuery("duna")).toEqual([]);
  });

  it("lança erro quando a resposta não é ok", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false));

    await expect(searchIsbndbByQuery("duna")).rejects.toThrow(
      "Erro ao buscar livros na ISBNDB",
    );
  });
});

describe("sem VITE_ISBNDB_API_KEY configurada", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_ISBNDB_API_KEY", "");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("searchIsbndbByGenre lança erro", async () => {
    const mod = await import("./isbndb");
    await expect(mod.searchIsbndbByGenre("Fantasy")).rejects.toThrow(
      "VITE_ISBNDB_API_KEY não configurada",
    );
  });

  it("getIsbndbBookByIsbn lança erro", async () => {
    const mod = await import("./isbndb");
    await expect(mod.getIsbndbBookByIsbn("1")).rejects.toThrow(
      "VITE_ISBNDB_API_KEY não configurada",
    );
  });

  it("searchIsbndbByQuery lança erro", async () => {
    const mod = await import("./isbndb");
    await expect(mod.searchIsbndbByQuery("duna")).rejects.toThrow(
      "VITE_ISBNDB_API_KEY não configurada",
    );
  });
});
