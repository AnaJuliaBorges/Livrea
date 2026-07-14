import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  searchGoogleBooks,
  getGoogleBookById,
  searchGoogleBooksByISBN,
  enrichBookFromGoogle,
} from "./googleBooks";

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const fetchMock = () => vi.mocked(fetch);

describe("searchGoogleBooks", () => {
  it("retorna os items da resposta", async () => {
    fetchMock().mockResolvedValue(jsonResponse({ items: [{ id: "1" }] }));

    const result = await searchGoogleBooks("duna");

    expect(result).toEqual([{ id: "1" }]);
  });

  it("retorna array vazio quando a resposta não tem items", async () => {
    fetchMock().mockResolvedValue(jsonResponse({}));

    expect(await searchGoogleBooks("duna")).toEqual([]);
  });

  it("lança erro quando a resposta não é ok", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false));

    await expect(searchGoogleBooks("duna")).rejects.toThrow(
      "Erro ao buscar livros",
    );
  });
});

describe("getGoogleBookById", () => {
  it("retorna os dados do livro", async () => {
    fetchMock().mockResolvedValue(jsonResponse({ id: "vol-1" }));

    expect(await getGoogleBookById("vol-1")).toEqual({ id: "vol-1" });
  });

  it("retorna null quando a resposta não é ok", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false));

    expect(await getGoogleBookById("vol-1")).toBeNull();
  });

  it("retorna null quando o fetch lança erro", async () => {
    fetchMock().mockRejectedValue(new Error("network error"));

    expect(await getGoogleBookById("vol-1")).toBeNull();
  });
});

describe("searchGoogleBooksByISBN", () => {
  it("retorna os items da resposta", async () => {
    fetchMock().mockResolvedValue(jsonResponse({ items: [{ id: "1" }] }));

    expect(await searchGoogleBooksByISBN("9788528623253")).toEqual([
      { id: "1" },
    ]);
  });

  it("retorna array vazio quando a resposta não é ok", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false));

    expect(await searchGoogleBooksByISBN("9788528623253")).toEqual([]);
  });

  it("retorna array vazio quando o fetch lança erro", async () => {
    fetchMock().mockRejectedValue(new Error("network error"));

    expect(await searchGoogleBooksByISBN("9788528623253")).toEqual([]);
  });
});

describe("enrichBookFromGoogle", () => {
  it("retorna título, nota e contagem do primeiro item", async () => {
    fetchMock().mockResolvedValue(
      jsonResponse({
        items: [
          {
            volumeInfo: {
              title: "Duna",
              averageRating: 4.5,
              ratingsCount: 100,
            },
          },
        ],
      }),
    );

    expect(await enrichBookFromGoogle("Dune")).toEqual({
      title_pt: "Duna",
      averageRating: 4.5,
      ratingsCount: 100,
    });
  });

  it("retorna null quando não há items", async () => {
    fetchMock().mockResolvedValue(jsonResponse({ items: [] }));

    expect(await enrichBookFromGoogle("Dune")).toBeNull();
  });

  it("retorna null quando a resposta não é ok", async () => {
    fetchMock().mockResolvedValue(jsonResponse(null, false));

    expect(await enrichBookFromGoogle("Dune")).toBeNull();
  });

  it("retorna null quando o fetch lança erro", async () => {
    fetchMock().mockRejectedValue(new Error("network error"));

    expect(await enrichBookFromGoogle("Dune")).toBeNull();
  });

  it("usa título vazio quando volumeInfo não tem título", async () => {
    fetchMock().mockResolvedValue(
      jsonResponse({ items: [{ volumeInfo: {} }] }),
    );

    expect(await enrichBookFromGoogle("Dune")).toEqual({
      title_pt: "",
      averageRating: undefined,
      ratingsCount: undefined,
    });
  });
});
