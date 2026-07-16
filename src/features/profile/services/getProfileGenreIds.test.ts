import { supabase } from "@/lib/supabase";
import { getProfileGenreIds } from "./getProfileGenreIds";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const fromMock = vi.mocked(supabase.from);
const eqMock = vi.fn();
const selectMock = vi.fn(() => ({ eq: eqMock }));

function selectResult(data: unknown, error: unknown = null) {
  return { data, error };
}

describe("getProfileGenreIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({
      select: selectMock,
    } as unknown as ReturnType<typeof supabase.from>);
  });

  it("busca os genre_id do usuário e retorna só os ids", async () => {
    eqMock.mockResolvedValue(
      selectResult([{ genre_id: 3 }, { genre_id: 7 }, { genre_id: 12 }]),
    );

    const ids = await getProfileGenreIds("user-1");

    expect(fromMock).toHaveBeenCalledWith("profile_genres");
    expect(selectMock).toHaveBeenCalledWith("genre_id");
    expect(eqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(ids).toEqual([3, 7, 12]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    eqMock.mockResolvedValue(selectResult(null));

    expect(await getProfileGenreIds("user-1")).toEqual([]);
  });

  it("propaga o erro da query", async () => {
    eqMock.mockResolvedValue(
      selectResult(null, new Error("permissão negada")),
    );

    await expect(getProfileGenreIds("user-1")).rejects.toThrow(
      "permissão negada",
    );
  });
});
