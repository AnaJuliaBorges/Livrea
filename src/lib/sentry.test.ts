import * as Sentry from "@sentry/react";
import type { ErrorEvent, EventHint } from "@sentry/react";
import { supabase } from "./supabase";
import { initSentry } from "./sentry";

vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  setUser: vi.fn(),
  replayIntegration: vi.fn(() => ({ name: "Replay" })),
}));
vi.mock("./supabase", () => ({
  supabase: { auth: { onAuthStateChange: vi.fn() } },
}));

const initMock = vi.mocked(Sentry.init);
const setUserMock = vi.mocked(Sentry.setUser);
const onAuthStateChangeMock = vi.mocked(supabase.auth.onAuthStateChange);

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

// devolve o beforeSend registrado no init
function getBeforeSend() {
  return initMock.mock.calls[0][0]!.beforeSend!;
}

// dispara o callback que initSentry registrou no onAuthStateChange
function emitAuthState(session: unknown) {
  const listener = onAuthStateChangeMock.mock.calls[0][0];
  (listener as (event: string, session: unknown) => void)(
    "SIGNED_IN",
    session,
  );
}

describe("initSentry", () => {
  it("não inicializa nada sem DSN", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "");

    initSentry();

    expect(initMock).not.toHaveBeenCalled();
    expect(onAuthStateChangeMock).not.toHaveBeenCalled();
  });

  it("inicializa com o DSN e só habilita em produção", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://exemplo@sentry.io/1");

    initSentry();

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock.mock.calls[0][0]).toMatchObject({
      dsn: "https://exemplo@sentry.io/1",
      enabled: false, // import.meta.env.PROD é false nos testes
    });
  });

  it("descarta evento de falha de rede", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://exemplo@sentry.io/1");
    initSentry();

    const event = {} as ErrorEvent;
    const hint = {
      originalException: new TypeError("Failed to fetch"),
    } as EventHint;

    expect(getBeforeSend()(event, hint)).toBeNull();
  });

  it("mantém evento que não é de rede", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://exemplo@sentry.io/1");
    initSentry();

    const event = {} as ErrorEvent;
    const hint = {
      originalException: new Error("Cannot read properties of undefined"),
    } as EventHint;

    expect(getBeforeSend()(event, hint)).toBe(event);
  });

  it("identifica o usuário logado apenas pelo id", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://exemplo@sentry.io/1");
    initSentry();

    emitAuthState({ user: { id: "user-1", email: "ana@exemplo.com" } });

    expect(setUserMock).toHaveBeenCalledWith({ id: "user-1" });
  });

  it("limpa o usuário quando a sessão acaba", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://exemplo@sentry.io/1");
    initSentry();

    emitAuthState(null);

    expect(setUserMock).toHaveBeenCalledWith(null);
  });
});
