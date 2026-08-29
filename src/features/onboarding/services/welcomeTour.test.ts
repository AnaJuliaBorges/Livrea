import { supabase } from "@/lib/supabase";
import { getWelcomeTourSeen, markWelcomeTourSeen } from "./welcomeTour";

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: { getSession: vi.fn() }, from: vi.fn() },
}));

const getSessionMock = vi.mocked(supabase.auth.getSession);
const fromMock = vi.mocked(supabase.from);

type SessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;

function mockUser(userId: string | null) {
  getSessionMock.mockResolvedValue({
    data: { session: userId ? { user: { id: userId } } : null },
  } as unknown as SessionResult);
}

function mockSelect(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  fromMock.mockReturnValue({ select } as never);
  return { select, eq, maybeSingle };
}

function mockUpdate(result: { error: unknown }) {
  const eq = vi.fn().mockResolvedValue(result);
  const update = vi.fn(() => ({ eq }));
  fromMock.mockReturnValue({ update } as never);
  return { update, eq };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getWelcomeTourSeen", () => {
  it("é falso quando a coluna está false", async () => {
    mockUser("user-1");
    mockSelect({ data: { welcome_tour_seen: false }, error: null });

    expect(await getWelcomeTourSeen()).toBe(false);
  });

  it("é verdadeiro quando a coluna está true", async () => {
    mockUser("user-1");
    const chain = mockSelect({
      data: { welcome_tour_seen: true },
      error: null,
    });

    expect(await getWelcomeTourSeen()).toBe(true);
    expect(chain.eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("trata ausência de sessão como já visto, sem consultar profiles", async () => {
    mockUser(null);

    expect(await getWelcomeTourSeen()).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("propaga erro da consulta", async () => {
    mockUser("user-1");
    mockSelect({ data: null, error: new Error("rls") });

    await expect(getWelcomeTourSeen()).rejects.toThrow("rls");
  });
});

describe("markWelcomeTourSeen", () => {
  it("marca a coluna como true para o usuário atual", async () => {
    mockUser("user-1");
    const chain = mockUpdate({ error: null });

    await markWelcomeTourSeen();

    expect(chain.update).toHaveBeenCalledWith({ welcome_tour_seen: true });
    expect(chain.eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("propaga erro do update", async () => {
    mockUser("user-1");
    mockUpdate({ error: new Error("offline") });

    await expect(markWelcomeTourSeen()).rejects.toThrow("offline");
  });

  it("não faz nada sem sessão", async () => {
    mockUser(null);

    await markWelcomeTourSeen();

    expect(fromMock).not.toHaveBeenCalled();
  });
});
