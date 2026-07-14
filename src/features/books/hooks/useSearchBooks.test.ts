import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSearchBooks } from "./useSearchBooks";
import { searchIsbndbByGenre, searchIsbndbByQuery } from "../api/isbndb";
import { createWrapper } from "./testQueryClient";
import type { IsbndbBook } from "../types/isbndb";

vi.mock("../api/isbndb", () => ({
  searchIsbndbByGenre: vi.fn(),
  searchIsbndbByQuery: vi.fn(),
}));

const byGenreMock = vi.mocked(searchIsbndbByGenre);
const byQueryMock = vi.mocked(searchIsbndbByQuery);

function makeBook(isbn: string, title: string): IsbndbBook {
  return { isbn, isbn13: isbn, title };
}

beforeEach(() => {
  byGenreMock.mockReset();
  byQueryMock.mockReset();
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

  it("trata erro em um gênero sem quebrar os demais", async () => {
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
