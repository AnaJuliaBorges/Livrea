import { renderHook, waitFor, act } from "@testing-library/react";
import { useDeleteClub } from "./useDeleteClub";
import { deleteClub } from "../services/clubs";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/clubs", () => ({
  deleteClub: vi.fn(),
}));

const deleteClubMock = vi.mocked(deleteClub);

beforeEach(() => {
  deleteClubMock.mockReset();
});

describe("useDeleteClub", () => {
  it("chama deleteClub com o id do clube", async () => {
    deleteClubMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteClub(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("club-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteClubMock.mock.calls[0][0]).toBe("club-1");
  });

  it("expõe o erro quando a exclusão falha", async () => {
    deleteClubMock.mockRejectedValue(new Error("Apenas o administrador pode excluir o clube"));

    const { result } = renderHook(() => useDeleteClub(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("club-1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(
      new Error("Apenas o administrador pode excluir o clube"),
    );
  });
});
