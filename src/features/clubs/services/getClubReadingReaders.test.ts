import { supabase } from "@/lib/supabase";
import { getClubReadingReaders } from "./getClubReadingReaders";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("getClubReadingReaders", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_reading_readers e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          user_id: "user-1",
          name: "Ana Júlia",
          avatar_url: "https://cdn/avatar.png",
          is_admin: true,
          progress: 78,
          started: true,
          rating: null,
        },
        {
          user_id: "user-2",
          name: "Bruna",
          avatar_url: null,
          is_admin: false,
          progress: 100,
          started: true,
          rating: 4,
        },
      ]),
    );

    const readers = await getClubReadingReaders("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_reading_readers", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(readers).toEqual([
      {
        userId: "user-1",
        name: "Ana Júlia",
        avatarUrl: "https://cdn/avatar.png",
        isAdmin: true,
        progress: 78,
        started: true,
        rating: null,
      },
      {
        userId: "user-2",
        name: "Bruna",
        avatarUrl: null,
        isAdmin: false,
        progress: 100,
        started: true,
        rating: 4,
      },
    ]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getClubReadingReaders("club-1", "book-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubReadingReaders("club-1", "book-1")).rejects.toThrow(
      "boom",
    );
  });
});
