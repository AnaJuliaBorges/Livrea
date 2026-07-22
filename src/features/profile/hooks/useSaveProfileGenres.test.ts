import { renderHook, waitFor, act } from "@testing-library/react";
import { useSaveProfileGenres } from "./useSaveProfileGenres";
import { saveProfileGenres } from "../services/saveProfileGenres";
import { createWrapper } from "./testQueryClient";

vi.mock("../services/saveProfileGenres", () => ({
  saveProfileGenres: vi.fn(),
}));

const saveProfileGenresMock = vi.mocked(saveProfileGenres);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSaveProfileGenres", () => {
  it("salva os gêneros com userId e lista de ids", async () => {
    saveProfileGenresMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSaveProfileGenres(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ userId: "user-1", genreIds: [1, 2, 3] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(saveProfileGenresMock).toHaveBeenCalledWith("user-1", [1, 2, 3]);
  });

  it("expõe o erro quando salvar falha", async () => {
    saveProfileGenresMock.mockRejectedValue(new Error("falha na RPC"));

    const { result } = renderHook(() => useSaveProfileGenres(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ userId: "user-1", genreIds: [] });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
