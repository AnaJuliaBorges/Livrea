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

// initSentry só roda em produção; os testes de comportamento precisam simular
// isso, senão caem no early return
function initInProduction(dsn = "https://exemplo@sentry.io/1") {
  vi.stubEnv("VITE_SENTRY_DSN", dsn);
  vi.stubEnv("PROD", true);
  initSentry();
}

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

  // o SDK não deve nem carregar fora de produção: em dev o Vite serviria
  // Sentry + Replay sem bundle, pesando em todo page load
  it("não inicializa fora de produção, mesmo com DSN", () => {
    vi.stubEnv("VITE_SENTRY_DSN", "https://exemplo@sentry.io/1");

    initSentry();

    expect(initMock).not.toHaveBeenCalled();
    expect(onAuthStateChangeMock).not.toHaveBeenCalled();
  });

  it("inicializa com o DSN em produção", () => {
    initInProduction();

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock.mock.calls[0][0]).toMatchObject({
      dsn: "https://exemplo@sentry.io/1",
      environment: "test",
    });
  });

  it("descarta evento de falha de rede", () => {
    initInProduction();

    const event = {} as ErrorEvent;
    const hint = {
      originalException: new TypeError("Failed to fetch"),
    } as EventHint;

    expect(getBeforeSend()(event, hint)).toBeNull();
  });

  it("mantém evento que não é de rede", () => {
    initInProduction();

    const event = {} as ErrorEvent;
    const hint = {
      originalException: new Error("Cannot read properties of undefined"),
    } as EventHint;

    expect(getBeforeSend()(event, hint)).toBe(event);
  });

  it("identifica o usuário logado apenas pelo id", () => {
    initInProduction();

    emitAuthState({ user: { id: "user-1", email: "ana@exemplo.com" } });

    expect(setUserMock).toHaveBeenCalledWith({ id: "user-1" });
  });

  it("limpa o usuário quando a sessão acaba", () => {
    initInProduction();

    emitAuthState(null);

    expect(setUserMock).toHaveBeenCalledWith(null);
  });
});
