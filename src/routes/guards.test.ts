import { protectedLoader, publicOnlyLoader } from "./guards";
import { supabase } from "@/lib/supabase";
import { GOOGLE_SIGNUP_PENDING_KEY } from "@/features/auth/services/signInWithGoogle";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getSession: vi.fn() },
    from: vi.fn(),
  },
}));

const getSessionMock = vi.mocked(supabase.auth.getSession);
const fromMock = vi.mocked(supabase.from);

function mockSession(session: unknown) {
  getSessionMock.mockResolvedValue({
    data: { session },
  } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);
}

function googleSession(userId = "user-1") {
  return { user: { id: userId, app_metadata: { provider: "google" } } };
}

function mockProfileStateId(stateId: number | null) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { state_id: stateId },
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  fromMock.mockReturnValue({ select } as unknown as ReturnType<
    typeof supabase.from
  >);
  return { select, eq, maybeSingle };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("protectedLoader", () => {
  it("redireciona para /login quando não há sessão", async () => {
    mockSession(null);

    const result = await protectedLoader();

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("Location")).toBe("/login");
  });

  it("libera a rota quando há sessão", async () => {
    mockSession({ user: { id: "user-1" } });

    const result = await protectedLoader();

    expect(result).toBeNull();
  });
});

describe("publicOnlyLoader", () => {
  it("libera a tela de visitante quando não há sessão", async () => {
    mockSession(null);

    const result = await publicOnlyLoader();

    expect(result).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("manda o usuário logado por email direto para /clubes (sem consultar o perfil)", async () => {
    mockSession({ user: { id: "user-1", app_metadata: { provider: "email" } } });

    const result = await publicOnlyLoader();

    expect((result as Response).headers.get("Location")).toBe("/clubes");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("manda a conta Google com perfil incompleto para /cadastrar e seta a flag", async () => {
    mockSession(googleSession());
    mockProfileStateId(null);

    const result = await publicOnlyLoader();

    expect((result as Response).headers.get("Location")).toBe("/cadastrar");
    expect(localStorage.getItem(GOOGLE_SIGNUP_PENDING_KEY)).toBe("1");
  });

  it("manda a conta Google já onboardada para /clubes sem setar a flag", async () => {
    mockSession(googleSession());
    mockProfileStateId(25);

    const result = await publicOnlyLoader();

    expect((result as Response).headers.get("Location")).toBe("/clubes");
    expect(localStorage.getItem(GOOGLE_SIGNUP_PENDING_KEY)).toBeNull();
  });
});
