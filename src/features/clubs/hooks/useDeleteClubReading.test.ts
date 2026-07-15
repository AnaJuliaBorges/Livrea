import { renderHook, waitFor, act } from "@testing-library/react";
import { useDeleteClubReading } from "./useDeleteClubReading";
import { deleteClubReading } from "../services/deleteClubReading";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/deleteClubReading", () => ({
  deleteClubReading: vi.fn(),
}));

const deleteClubReadingMock = vi.mocked(deleteClubReading);

beforeEach(() => {
  deleteClubReadingMock.mockReset();
});

describe("useDeleteClubReading", () => {
  it("chama deleteClubReading com o id do clube", async () => {
    deleteClubReadingMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteClubReading("club-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteClubReadingMock).toHaveBeenCalledWith("club-1");
  });
});
