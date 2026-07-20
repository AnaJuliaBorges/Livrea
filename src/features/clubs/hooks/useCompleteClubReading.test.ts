import { renderHook, waitFor, act } from "@testing-library/react";
import { useCompleteClubReading } from "./useCompleteClubReading";
import { completeClubReading } from "../services/clubReadings";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/clubReadings", () => ({
  completeClubReading: vi.fn(),
}));

const completeClubReadingMock = vi.mocked(completeClubReading);

beforeEach(() => {
  completeClubReadingMock.mockReset();
});

describe("useCompleteClubReading", () => {
  it("chama completeClubReading com o id do clube", async () => {
    completeClubReadingMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompleteClubReading("club-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(completeClubReadingMock).toHaveBeenCalledWith("club-1");
  });

  it("expõe o erro quando a conclusão falha", async () => {
    completeClubReadingMock.mockRejectedValue(
      new Error("O clube não tem uma leitura atual"),
    );

    const { result } = renderHook(() => useCompleteClubReading("club-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(
      new Error("O clube não tem uma leitura atual"),
    );
  });
});
