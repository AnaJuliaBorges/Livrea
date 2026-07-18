import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useReadingTracking,
  useSaveReadingProgress,
  useSaveHighlight,
  useUpdateHighlight,
  useSaveReview,
} from "./useReadingTracking";
import {
  getReadingTracking,
  saveReadingProgress,
  saveHighlight,
  updateHighlight,
  saveReview,
  type ReadingTracking,
} from "../services/readingTracking";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/readingTracking", () => ({
  getReadingTracking: vi.fn(),
  saveReadingProgress: vi.fn(),
  saveHighlight: vi.fn(),
  updateHighlight: vi.fn(),
  saveReview: vi.fn(),
}));

const getTrackingMock = vi.mocked(getReadingTracking);
const saveProgressMock = vi.mocked(saveReadingProgress);
const saveHighlightMock = vi.mocked(saveHighlight);
const updateHighlightMock = vi.mocked(updateHighlight);
const saveReviewMock = vi.mocked(saveReview);

const tracking: ReadingTracking = {
  currentPage: 10,
  rating: null,
  review: null,
  logs: [],
  highlights: [],
};

beforeEach(() => {
  getTrackingMock.mockReset();
  saveProgressMock.mockReset();
  saveHighlightMock.mockReset();
  updateHighlightMock.mockReset();
  saveReviewMock.mockReset();
  getTrackingMock.mockResolvedValue(tracking);
});

describe("useReadingTracking", () => {
  it("busca o progresso quando há bookId", async () => {
    const { result } = renderHook(() => useReadingTracking("book-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getTrackingMock).toHaveBeenCalledWith("book-1");
    expect(result.current.data).toEqual(tracking);
  });

  it("não busca quando não há bookId", () => {
    const { result } = renderHook(() => useReadingTracking(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useSaveReadingProgress", () => {
  it("salva o progresso e invalida o cache do tracking", async () => {
    saveProgressMock.mockResolvedValue(undefined);
    const wrapper = createWrapper();

    const { result: trackingResult } = renderHook(
      () => useReadingTracking("book-1"),
      { wrapper },
    );
    await waitFor(() => expect(trackingResult.current.isSuccess).toBe(true));
    getTrackingMock.mockClear();

    const { result } = renderHook(() => useSaveReadingProgress("book-1"), {
      wrapper,
    });

    act(() => {
      result.current.mutate({
        currentPage: 50,
        feeling: "gostei",
        note: "boa!",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(saveProgressMock).toHaveBeenCalledWith("book-1", 50, "gostei", "boa!");
    await waitFor(() => expect(getTrackingMock).toHaveBeenCalled());
  });
});

describe("useSaveHighlight", () => {
  it("salva o destaque", async () => {
    saveHighlightMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSaveHighlight("book-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ page: 10, quote: "Frase" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(saveHighlightMock).toHaveBeenCalledWith("book-1", 10, "Frase");
  });
});

describe("useUpdateHighlight", () => {
  it("atualiza o destaque", async () => {
    updateHighlightMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateHighlight("book-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        highlightId: "hl-1",
        page: 20,
        quote: "Outra frase",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateHighlightMock).toHaveBeenCalledWith(
      "hl-1",
      20,
      "Outra frase",
    );
  });
});

describe("useSaveReview", () => {
  it("salva a avaliação", async () => {
    saveReviewMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSaveReview("book-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ rating: 5, review: "Ótimo" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(saveReviewMock).toHaveBeenCalledWith("book-1", 5, "Ótimo");
  });
});
