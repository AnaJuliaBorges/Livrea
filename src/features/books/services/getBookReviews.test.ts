import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBookReviews } from "./getBookReviews";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

describe("getBookReviews", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("mapeia as avaliações para o formato BookReview", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          user_id: "user-1",
          name: "Ana",
          avatar_url: "https://cdn.example.com/ana.png",
          rating: 4.5,
          review: "Adorei!",
          created_at: "2026-07-10T12:00:00Z",
        },
        {
          user_id: "user-2",
          name: "Bia",
          avatar_url: null,
          rating: 3,
          review: null,
          created_at: "2026-07-09T12:00:00Z",
        },
      ]),
    );

    const reviews = await getBookReviews("book-1");

    expect(rpcMock).toHaveBeenCalledWith("get_book_reviews", {
      p_book_id: "book-1",
    });
    expect(reviews).toEqual([
      {
        id: "user-1",
        user: {
          id: "user-1",
          name: "Ana",
          photo: "https://cdn.example.com/ana.png",
        },
        created_at: "2026-07-10T12:00:00Z",
        rating: 4.5,
        comment: "Adorei!",
        likes: 0,
      },
      {
        id: "user-2",
        user: { id: "user-2", name: "Bia", photo: "" },
        created_at: "2026-07-09T12:00:00Z",
        rating: 3,
        comment: "",
        likes: 0,
      },
    ]);
  });

  it("retorna lista vazia quando não há avaliações", async () => {
    rpcMock.mockResolvedValue(rpcResult([]));

    const reviews = await getBookReviews("book-1");

    expect(reviews).toEqual([]);
  });

  it("lança o erro retornado pela RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("RPC não existe")));

    await expect(getBookReviews("book-1")).rejects.toThrow("RPC não existe");
  });
});
