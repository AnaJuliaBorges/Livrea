import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUpsertBook } from "./useUpsertBook";
import { upsertBook } from "../services/upsertBook";
import { createWrapper } from "./testQueryClient";
import type { Book } from "../types/book";

vi.mock("../services/upsertBook", () => ({
  upsertBook: vi.fn(),
}));

const upsertBookMock = vi.mocked(upsertBook);

beforeEach(() => {
  upsertBookMock.mockReset();
});

const book: Book = {
  google_id: "1",
  info: { isbn: "123", title: "Duna", subtitle: "", authors: [] },
  genre: {},
  publisher: { publisher: "", publisherDate: "" },
  image: {},
};

describe("useUpsertBook", () => {
  it("chama upsertBook e retorna o id salvo", async () => {
    upsertBookMock.mockResolvedValue("book-1");

    const { result } = renderHook(() => useUpsertBook(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(book);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(upsertBookMock.mock.calls[0][0]).toEqual(book);
    expect(result.current.data).toBe("book-1");
  });
});
