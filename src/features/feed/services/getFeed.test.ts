import { supabase } from "@/lib/supabase";
import { getFeed } from "./getFeed";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const rpcMock = vi.mocked(supabase.rpc);

function rpcResult(data: unknown = null, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

const rawActor = { id: "u1", name: "Ana", avatar_url: "ana.jpg" };
const rawBook = { id: "b1", title: "Torto Arado", image: "capa.jpg" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getFeed", () => {
  it("chama get_feed com os parâmetros de paginação", async () => {
    rpcMock.mockResolvedValue(rpcResult([]));

    await getFeed(40);

    expect(rpcMock).toHaveBeenCalledWith("get_feed", {
      p_limit: 20,
      p_offset: 40,
    });
  });

  it("usa offset 0 e page size padrão quando não informado", async () => {
    rpcMock.mockResolvedValue(rpcResult([]));

    await getFeed();

    expect(rpcMock).toHaveBeenCalledWith("get_feed", {
      p_limit: 20,
      p_offset: 0,
    });
  });

  it("mapeia snake_case → camelCase de cada tipo de evento", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        {
          id: "started_book:u1:b1",
          type: "started_book",
          created_at: "2026-07-20T10:00:00Z",
          actor: rawActor,
          book: rawBook,
          club: null,
          rating: null,
          review: null,
        },
        {
          id: "finished_book:u1:b1",
          type: "finished_book",
          created_at: "2026-07-19T10:00:00Z",
          actor: rawActor,
          book: rawBook,
          club: null,
          rating: null,
          review: null,
        },
        {
          id: "reviewed_book:u1:b1",
          type: "reviewed_book",
          created_at: "2026-07-18T10:00:00Z",
          actor: rawActor,
          book: rawBook,
          club: null,
          rating: 5,
          review: "Recomendo!",
        },
        {
          id: "joined_club:u1:c1",
          type: "joined_club",
          created_at: "2026-07-17T10:00:00Z",
          actor: rawActor,
          book: null,
          club: { id: "c1", name: "Leituras de Sábado", cover_url: "cover.jpg" },
          rating: null,
          review: null,
        },
      ]),
    );

    const events = await getFeed();

    expect(events).toEqual([
      {
        id: "started_book:u1:b1",
        type: "started_book",
        createdAt: "2026-07-20T10:00:00Z",
        actor: { id: "u1", name: "Ana", avatarUrl: "ana.jpg" },
        book: { id: "b1", title: "Torto Arado", image: "capa.jpg" },
      },
      {
        id: "finished_book:u1:b1",
        type: "finished_book",
        createdAt: "2026-07-19T10:00:00Z",
        actor: { id: "u1", name: "Ana", avatarUrl: "ana.jpg" },
        book: { id: "b1", title: "Torto Arado", image: "capa.jpg" },
      },
      {
        id: "reviewed_book:u1:b1",
        type: "reviewed_book",
        createdAt: "2026-07-18T10:00:00Z",
        actor: { id: "u1", name: "Ana", avatarUrl: "ana.jpg" },
        book: { id: "b1", title: "Torto Arado", image: "capa.jpg" },
        rating: 5,
        review: "Recomendo!",
      },
      {
        id: "joined_club:u1:c1",
        type: "joined_club",
        createdAt: "2026-07-17T10:00:00Z",
        actor: { id: "u1", name: "Ana", avatarUrl: "ana.jpg" },
        club: { id: "c1", name: "Leituras de Sábado", coverUrl: "cover.jpg" },
      },
    ]);
  });

  it("retorna lista vazia quando data é null", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    await expect(getFeed()).resolves.toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getFeed()).rejects.toThrow("boom");
  });
});
