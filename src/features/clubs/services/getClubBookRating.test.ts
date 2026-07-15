import { supabase } from "@/lib/supabase";
import { getClubBookRating } from "./getClubBookRating";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("getClubBookRating", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_book_rating e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult({ club_average: 4.2, club_count: 5, my_rating: 5 }),
    );

    const rating = await getClubBookRating("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_book_rating", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(rating).toEqual({
      clubAverage: 4.2,
      clubCount: 5,
      myRating: 5,
    });
  });

  it("normaliza médias/nota ausentes (null) e contagem faltante", async () => {
    rpcMock.mockResolvedValue(
      rpcResult({ club_average: null, club_count: 0, my_rating: null }),
    );

    const rating = await getClubBookRating("club-1", "book-1");

    expect(rating).toEqual({
      clubAverage: null,
      clubCount: 0,
      myRating: null,
    });
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubBookRating("club-1", "book-1")).rejects.toThrow(
      "boom",
    );
  });
});
