import { supabase } from "@/lib/supabase";
import { getClubBookReviews } from "./clubReadings";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("getClubBookReviews", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("chama a RPC get_club_book_reviews e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          user_id: "user-1",
          name: "Ana Júlia",
          avatar_url: "https://cdn/avatar.png",
          rating: 5,
          review: "Livro incrível, li em dois dias.",
        },
        {
          user_id: "user-2",
          name: "Bruna",
          avatar_url: null,
          rating: null,
          review: "Gostei, mas o final é corrido.",
        },
      ]),
    );

    const reviews = await getClubBookReviews("club-1", "book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_club_book_reviews", {
      p_club_id: "club-1",
      p_book_id: "book-1",
    });
    expect(reviews).toEqual([
      {
        userId: "user-1",
        name: "Ana Júlia",
        avatarUrl: "https://cdn/avatar.png",
        rating: 5,
        review: "Livro incrível, li em dois dias.",
      },
      {
        userId: "user-2",
        name: "Bruna",
        avatarUrl: null,
        rating: null,
        review: "Gostei, mas o final é corrido.",
      },
    ]);
  });

  it("retorna lista vazia quando não há dados", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getClubBookReviews("club-1", "book-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getClubBookReviews("club-1", "book-1")).rejects.toThrow(
      "boom",
    );
  });
});
