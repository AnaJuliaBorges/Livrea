import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBooksByGenres } from "./useBooksByGenres";
import { getBooksByGenres, type GenreBook } from "../services/getBooksByGenres";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/getBooksByGenres", () => ({
  getBooksByGenres: vi.fn(),
}));

const getBooksByGenresMock = vi.mocked(getBooksByGenres);

beforeEach(() => {
  getBooksByGenresMock.mockReset();
});

describe("useBooksByGenres", () => {
  it("busca livros quando há ids de gênero", async () => {
    const books: GenreBook[] = [{ id: "1", isbn: "123", title: "Duna" }];
    getBooksByGenresMock.mockResolvedValue(books);

    const { result } = renderHook(() => useBooksByGenres([1, 2]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getBooksByGenresMock).toHaveBeenCalledWith([1, 2]);
    expect(result.current.data).toEqual(books);
  });

  it("não busca quando a lista de ids está vazia", () => {
    const { result } = renderHook(() => useBooksByGenres([]), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getBooksByGenresMock).not.toHaveBeenCalled();
  });
});
