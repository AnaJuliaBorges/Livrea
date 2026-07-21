import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSearchBooks } from "./useSearchBooks";
import { searchIsbndbByGenre, searchIsbndbByQuery } from "../api/isbndb";
import { reportError } from "@/lib/reportError";
import { createWrapper } from "./testQueryClient";
import type { IsbndbBook } from "../types/isbndb";

vi.mock("../api/isbndb", () => ({
  searchIsbndbByGenre: vi.fn(),
  searchIsbndbByQuery: vi.fn(),
}));
vi.mock("@/lib/reportError", () => ({ reportError: vi.fn() }));

const byGenreMock = vi.mocked(searchIsbndbByGenre);
const byQueryMock = vi.mocked(searchIsbndbByQuery);
const reportErrorMock = vi.mocked(reportError);

function makeBook(isbn: string, title: string): IsbndbBook {
  return { isbn, isbn13: isbn, title };
}

beforeEach(() => {
  byGenreMock.mockReset();
  byQueryMock.mockReset();
  reportErrorMock.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useSearchBooks", () => {
  it("fica desabilitado sem gêneros e sem busca válida", () => {
    const { result } = renderHook(() => useSearchBooks([], ""), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe("pending");
    expect(byGenreMock).not.toHaveBeenCalled();
    expect(byQueryMock).not.toHaveBeenCalled();
  });

  it("busca por texto quando a query tem mais de 2 caracteres", async () => {
    byQueryMock.mockResolvedValue([makeBook("1", "Duna")]);

    const { result } = renderHook(() => useSearchBooks([], "duna"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(byQueryMock).toHaveBeenCalledWith("duna", 20, 1);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].info.title).toBe("Duna");
  });

  it("busca por gêneros em paralelo e deduplica por isbn", async () => {
    byGenreMock.mockImplementation(async (genre: string) =>
      genre === "Fantasy"
        ? [makeBook("1", "Duna"), makeBook("2", "Duna Mensageiro")]
        : [makeBook("1", "Duna")],
    );

    const { result } = renderHook(
      () => useSearchBooks(["Fantasy", "Sci-Fi"], undefined),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toHaveLength(2);
  });

  it("filtra livros cujo título começa com 'box'", async () => {
    byQueryMock.mockResolvedValue([
      makeBook("1", "Box Trilogia"),
      makeBook("2", "Duna"),
    ]);

    const { result } = renderHook(() => useSearchBooks([], "duna"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].info.title).toBe("Duna");
  });

  it("trata erro em um gênero sem quebrar os demais, mas reporta a falha", async () => {
    byGenreMock.mockImplementation(async (genre: string) => {
      if (genre === "Fantasy") throw new Error("indisponível");
      return [makeBook("1", "Duna")];
    });

    const { result } = renderHook(
      () => useSearchBooks(["Fantasy", "Sci-Fi"], undefined),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toHaveLength(1);
    // falha parcial não quebra a tela, mas não pode sumir
    expect(reportErrorMock).toHaveBeenCalledWith(expect.any(Error), {
      source: "query",
      detail: 'isbndb subject "Fantasy"',
    });
  });

  // o caso da assinatura da ISBNDB vencida: antes virava lista vazia e a tela
  // dizia "nenhum livro encontrado", mandando investigar o lugar errado
  it("propaga o erro quando TODOS os gêneros falham", async () => {
    byGenreMock.mockRejectedValue(new Error("Erro ao buscar livros na ISBNDB"));

    const { result } = renderHook(
      () => useSearchBooks(["Fantasy", "Sci-Fi"], undefined),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toHaveLength(0);
  });

  it("propaga erro da busca por texto", async () => {
    byQueryMock.mockRejectedValue(new Error("Erro ao buscar livros na ISBNDB"));

    const { result } = renderHook(() => useSearchBooks([], "duna"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.isError).toBe(true);
  });

  it("indica próxima página quando a página atual está cheia e busca ao chamar fetchNextPage", async () => {
    const fullPage = Array.from({ length: 20 }, (_, i) =>
      makeBook(`${i}`, `Livro ${i}`),
    );
    byQueryMock.mockResolvedValueOnce(fullPage);
    byQueryMock.mockResolvedValueOnce([makeBook("20", "Livro extra")]);

    const { result } = renderHook(() => useSearchBooks([], "duna"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(byQueryMock).toHaveBeenCalledTimes(2));
    expect(byQueryMock).toHaveBeenNthCalledWith(2, "duna", 20, 2);
    await waitFor(() => expect(result.current.data).toHaveLength(21));
  });
});
