import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBook } from "./useBook";
import {
  getBook,
  enrichBookWithGoogle,
  needsGoogleEnrichment,
} from "../services/getBook";
import { createWrapper } from "./testQueryClient";
import type { BookTemp } from "../types/book";

vi.mock("../services/getBook", () => ({
  getBook: vi.fn(),
  enrichBookWithGoogle: vi.fn(),
  needsGoogleEnrichment: vi.fn(),
}));

const getBookMock = vi.mocked(getBook);
const enrichMock = vi.mocked(enrichBookWithGoogle);
const needsEnrichmentMock = vi.mocked(needsGoogleEnrichment);

beforeEach(() => {
  getBookMock.mockReset();
  enrichMock.mockReset();
  needsEnrichmentMock.mockReset();
});

const book = { id: "book-1", isbn: "123" } as BookTemp;

describe("useBook", () => {
  it("não busca quando não há id", () => {
    const { result } = renderHook(() => useBook(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getBookMock).not.toHaveBeenCalled();
  });

  it("busca o livro e não enriquece quando já está completo", async () => {
    getBookMock.mockResolvedValue(book);
    needsEnrichmentMock.mockReturnValue(false);

    const { result } = renderHook(() => useBook("book-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(book);
    expect(enrichMock).not.toHaveBeenCalled();
  });

  it("enriquece com o Google e refaz a busca do livro quando aplica dados novos", async () => {
    getBookMock.mockResolvedValue(book);
    needsEnrichmentMock.mockReturnValue(true);
    enrichMock.mockResolvedValue(true);

    renderHook(() => useBook("book-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(enrichMock).toHaveBeenCalledWith(book));
    await waitFor(() => expect(getBookMock).toHaveBeenCalledTimes(2));
  });

  it("não refaz a busca quando o enriquecimento não aplica dados novos", async () => {
    getBookMock.mockResolvedValue(book);
    needsEnrichmentMock.mockReturnValue(true);
    enrichMock.mockResolvedValue(false);

    const { result } = renderHook(() => useBook("book-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(enrichMock).toHaveBeenCalled());
    expect(getBookMock).toHaveBeenCalledTimes(1);
  });
});
