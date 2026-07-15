import { renderHook, waitFor } from "@testing-library/react";
import { useClubBookRating } from "./useClubBookRating";
import { getClubBookRating } from "../services/getClubBookRating";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/getClubBookRating", () => ({
  getClubBookRating: vi.fn(),
}));

const getClubBookRatingMock = vi.mocked(getClubBookRating);

beforeEach(() => {
  getClubBookRatingMock.mockReset();
});

describe("useClubBookRating", () => {
  it("busca a avaliação quando há clubId e bookId", async () => {
    getClubBookRatingMock.mockResolvedValue({
      clubAverage: 4.2,
      clubCount: 5,
      myRating: 5,
    });

    const { result } = renderHook(
      () => useClubBookRating("club-1", "book-1"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getClubBookRatingMock).toHaveBeenCalledWith("club-1", "book-1");
    expect(result.current.data?.clubAverage).toBe(4.2);
  });

  it("não busca quando falta bookId", () => {
    const { result } = renderHook(
      () => useClubBookRating("club-1", undefined),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(getClubBookRatingMock).not.toHaveBeenCalled();
  });
});
