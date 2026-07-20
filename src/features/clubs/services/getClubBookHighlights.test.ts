import { supabase } from "@/lib/supabase";
import { getClubBookHighlights } from "./clubReadings";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("getClubBookHighlights", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_book_highlights e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          user_id: "user-1",
          name: "Ana Júlia",
          avatar_url: "https://cdn/avatar.png",
          page: 42,
          quote: "O amor é a ponte.",
        },
      ]),
    );

    const highlights = await getClubBookHighlights("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_book_highlights", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(highlights).toEqual([
      {
        userId: "user-1",
        name: "Ana Júlia",
        avatarUrl: "https://cdn/avatar.png",
        page: 42,
        quote: "O amor é a ponte.",
      },
    ]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getClubBookHighlights("club-1", "book-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubBookHighlights("club-1", "book-1")).rejects.toThrow(
      "boom",
    );
  });
});
