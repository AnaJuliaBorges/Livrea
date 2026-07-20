import { supabase } from "@/lib/supabase";
import {
  followUser,
  getFollowers,
  getFollowing,
  getFollowInfo,
  unfollowUser,
} from "./follows";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const fromMock = vi.mocked(supabase.from);
const rpcMock = vi.mocked(supabase.rpc);
const getUserMock = vi.mocked(supabase.auth.getUser);

function rpcResult(data: unknown, error: unknown = null) {
  return { data, error } as unknown as Awaited<ReturnType<typeof supabase.rpc>>;
}

type BuilderResult = {
  data?: unknown;
  error?: unknown;
  count?: number | null;
};

// builder encadeável e "thenable" — await em qualquer ponto da cadeia resolve
// no mesmo resultado, como o query builder real do supabase-js
function makeBuilder(result: BuilderResult) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    maybeSingle: vi.fn(),
    then: (
      onFulfilled?: (value: BuilderResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.upsert.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue(result);
  return builder;
}

function queueBuilder(result: BuilderResult) {
  const builder = makeBuilder(result);
  fromMock.mockReturnValueOnce(
    builder as unknown as ReturnType<typeof supabase.from>,
  );
  return builder;
}

function authenticatedAs(userId: string) {
  getUserMock.mockResolvedValue({
    data: { user: { id: userId } },
    error: null,
  } as unknown as Awaited<ReturnType<typeof supabase.auth.getUser>>);
}

beforeEach(() => {
  vi.clearAllMocks();
  authenticatedAs("me-1");
});

describe("getFollowInfo", () => {
  it("retorna as contagens e isFollowing false sem follow", async () => {
    queueBuilder({ count: 7, error: null }); // seguidores
    queueBuilder({ count: 3, error: null }); // seguindo
    queueBuilder({ data: null, error: null }); // isFollowing

    const info = await getFollowInfo("user-2");

    expect(info).toEqual({
      followersCount: 7,
      followingCount: 3,
      isFollowing: false,
    });
  });

  it("retorna isFollowing true quando o usuário logado já segue", async () => {
    queueBuilder({ count: 1, error: null });
    queueBuilder({ count: 0, error: null });
    queueBuilder({ data: { follower_id: "me-1" }, error: null });

    const info = await getFollowInfo("user-2");

    expect(info).toEqual({
      followersCount: 1,
      followingCount: 0,
      isFollowing: true,
    });
  });

  it("filtra o follow pelo usuário logado e pelo perfil visto", async () => {
    queueBuilder({ count: 0, error: null });
    queueBuilder({ count: 0, error: null });
    const followBuilder = queueBuilder({ data: null, error: null });

    await getFollowInfo("user-2");

    expect(followBuilder.eq).toHaveBeenCalledWith("followed_id", "user-2");
    expect(followBuilder.eq).toHaveBeenCalledWith("follower_id", "me-1");
  });

  it("lança o erro retornado pela query de contagem", async () => {
    queueBuilder({ count: null, error: new Error("count falhou") });
    queueBuilder({ count: null, error: null });
    queueBuilder({ data: null, error: null });

    await expect(getFollowInfo("user-2")).rejects.toThrow("count falhou");
  });

  it("lança erro quando não há usuário autenticado", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.auth.getUser>>);

    await expect(getFollowInfo("user-2")).rejects.toThrow(
      "Usuário não autenticado",
    );
  });
});

describe("getFollowers", () => {
  it("chama a RPC get_followers e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        { id: "user-2", name: "Bia Leitora", avatar_url: "https://cdn/2.png" },
        { id: "user-3", name: "Caio", avatar_url: null },
      ]),
    );

    const followers = await getFollowers("user-1");

    expect(rpcMock).toHaveBeenCalledWith("get_followers", {
      p_user_id: "user-1",
    });
    expect(followers).toEqual([
      { id: "user-2", name: "Bia Leitora", avatarUrl: "https://cdn/2.png" },
      { id: "user-3", name: "Caio", avatarUrl: null },
    ]);
  });

  it("retorna lista vazia quando não há seguidores", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getFollowers("user-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getFollowers("user-1")).rejects.toThrow("boom");
  });
});

describe("getFollowing", () => {
  it("chama a RPC get_following e mapeia o retorno", async () => {
    rpcMock.mockResolvedValue(
      rpcResult([
        { id: "user-2", name: "Bia Leitora", avatar_url: "https://cdn/2.png" },
      ]),
    );

    const following = await getFollowing("user-1");

    expect(rpcMock).toHaveBeenCalledWith("get_following", {
      p_user_id: "user-1",
    });
    expect(following).toEqual([
      { id: "user-2", name: "Bia Leitora", avatarUrl: "https://cdn/2.png" },
    ]);
  });

  it("retorna lista vazia quando não segue ninguém", async () => {
    rpcMock.mockResolvedValue(rpcResult(null));

    expect(await getFollowing("user-1")).toEqual([]);
  });

  it("propaga o erro da RPC", async () => {
    rpcMock.mockResolvedValue(rpcResult(null, new Error("boom")));

    await expect(getFollowing("user-1")).rejects.toThrow("boom");
  });
});

describe("followUser", () => {
  it("insere o follow do usuário logado de forma idempotente", async () => {
    const builder = queueBuilder({ error: null });

    await followUser("user-2");

    expect(builder.upsert).toHaveBeenCalledWith(
      { follower_id: "me-1", followed_id: "user-2" },
      { onConflict: "follower_id,followed_id", ignoreDuplicates: true },
    );
  });

  it("lança o erro retornado pelo insert", async () => {
    queueBuilder({ error: new Error("RLS bloqueou") });

    await expect(followUser("user-2")).rejects.toThrow("RLS bloqueou");
  });
});

describe("unfollowUser", () => {
  it("remove o follow do usuário logado para o perfil visto", async () => {
    const builder = queueBuilder({ error: null });

    await unfollowUser("user-2");

    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("follower_id", "me-1");
    expect(builder.eq).toHaveBeenCalledWith("followed_id", "user-2");
  });

  it("lança o erro retornado pelo delete", async () => {
    queueBuilder({ error: new Error("delete falhou") });

    await expect(unfollowUser("user-2")).rejects.toThrow("delete falhou");
  });
});
