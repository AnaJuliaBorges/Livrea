import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSaveUserBooks } from "./useSaveUserBooks";
import { saveUserBooks } from "../services/saveUserBooks";
import { createWrapper } from "./testQueryClient";
import type { Book } from "../types/book";

vi.mock("../services/saveUserBooks", () => ({
  saveUserBooks: vi.fn(),
}));

const saveUserBooksMock = vi.mocked(saveUserBooks);

beforeEach(() => {
  saveUserBooksMock.mockReset();
});

const book: Book = {
  google_id: "1",
  info: { isbn: "123", title: "Duna", subtitle: "", authors: [] },
  genre: {},
  publisher: { publisher: "", publisherDate: "" },
  image: {},
};

describe("useSaveUserBooks", () => {
  it("chama saveUserBooks com os livros e o status", async () => {
    saveUserBooksMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSaveUserBooks(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ books: [book], status: "read" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(saveUserBooksMock).toHaveBeenCalledWith([book], "read");
  });
});
