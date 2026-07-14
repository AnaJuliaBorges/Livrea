import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBookReviews } from "./useBookReviews";
import { getBookReviews } from "../services/getBookReviews";
import { createWrapper } from "./testQueryClient";
import type { BookReview } from "../types/book";

vi.mock("../services/getBookReviews", () => ({
  getBookReviews: vi.fn(),
}));

const getBookReviewsMock = vi.mocked(getBookReviews);

beforeEach(() => {
  getBookReviewsMock.mockReset();
});

describe("useBookReviews", () => {
  it("busca as avaliações do livro quando há bookId", async () => {
    const reviews: BookReview[] = [
      {
        id: "1",
        user: { id: "1", name: "Ana", photo: "" },
        created_at: "2026-01-01",
        rating: 5,
        comment: "Ótimo",
        likes: 0,
      },
    ];
    getBookReviewsMock.mockResolvedValue(reviews);

    const { result } = renderHook(() => useBookReviews("book-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getBookReviewsMock).toHaveBeenCalledWith("book-1");
    expect(result.current.data).toEqual(reviews);
  });

  it("não busca quando não há bookId", () => {
    const { result } = renderHook(() => useBookReviews(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getBookReviewsMock).not.toHaveBeenCalled();
  });
});
