import { supabase } from "@/lib/supabase";
import { followUser, getFollowInfo, unfollowUser } from "./follows";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const fromMock = vi.mocked(supabase.from);
const getUserMock = vi.mocked(supabase.auth.getUser);

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
  it("retorna a contagem de seguidores e isFollowing false sem follow", async () => {
    queueBuilder({ count: 7, error: null });
    queueBuilder({ data: null, error: null });

    const info = await getFollowInfo("user-2");

    expect(info).toEqual({ followersCount: 7, isFollowing: false });
  });

  it("retorna isFollowing true quando o usuário logado já segue", async () => {
    queueBuilder({ count: 1, error: null });
    queueBuilder({ data: { follower_id: "me-1" }, error: null });

    const info = await getFollowInfo("user-2");

    expect(info).toEqual({ followersCount: 1, isFollowing: true });
  });

  it("filtra o follow pelo usuário logado e pelo perfil visto", async () => {
    queueBuilder({ count: 0, error: null });
    const followBuilder = queueBuilder({ data: null, error: null });

    await getFollowInfo("user-2");

    expect(followBuilder.eq).toHaveBeenCalledWith("followed_id", "user-2");
    expect(followBuilder.eq).toHaveBeenCalledWith("follower_id", "me-1");
  });

  it("lança o erro retornado pela query de contagem", async () => {
    queueBuilder({ count: null, error: new Error("count falhou") });
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
