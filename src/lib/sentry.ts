import * as Sentry from "@sentry/react";
import { supabase } from "./supabase";

// Init do Sentry + identificação do usuário. Chamado uma vez em main.tsx,
// antes do render, pra capturar também erro que aconteça já na montagem.
//
// Sem VITE_SENTRY_DSN (dev local, CI, testes) nada é inicializado: o
// captureException de reportError.ts vira no-op e o erro só aparece no
// console. `enabled: PROD` é a segunda trava — mesmo com DSN preenchido no
// .env local, hot reload não queima quota.

// Falha de rede (usuário sem sinal, aba offline, request cancelado ao trocar
// de página) não é bug da aplicação e dominaria o volume de eventos. O filtro
// mora aqui, e não em reportError, pra que "o que é ruído" seja uma decisão
// só — inclusive para erros que o Sentry captura sozinho.
const NETWORK_ERROR_PATTERN =
  /Failed to fetch|NetworkError|Load failed|network request failed/i;

function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return NETWORK_ERROR_PATTERN.test(message);
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Fora de produção nem inicializa. Antes o guard era só `enabled: PROD`, que
  // impedia o envio mas ainda carregava o SDK: em dev o Vite serve Sentry +
  // Replay sem bundle, o que engorda o grafo de módulos de todo page load —
  // no e2e isso empurrava o WebKit por cima do timeout de forma intermitente.
  if (!dsn || !import.meta.env.PROD) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    enableLogs: true,
    // sem tracing de propósito: performance já é coberta pelo
    // @vercel/speed-insights (App.tsx), e ligar aqui duplicaria o dado
    // gastando quota
    integrations: [Sentry.replayIntegration()],
    // grava 10% das sessões e 100% das que deram erro. Os defaults de
    // privacidade do replay (maskAllText, blockAllMedia) ficam ligados — o
    // que é gravado é o fluxo, não o conteúdo do chat nem os dados do perfil.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      return isNetworkError(hint.originalException) ? null : event;
    },
  });

  // Identifica quem sofreu o erro — só o id, nunca e-mail ou nome. Sem isso
  // todo evento chega anônimo e não dá pra responder "quantas pessoas isso
  // afetou?". INITIAL_SESSION cobre o reload com sessão já ativa.
  // Assinatura sem unsubscribe: vive o tempo todo da aplicação.
  supabase.auth.onAuthStateChange((_event, session) => {
    Sentry.setUser(session ? { id: session.user.id } : null);
  });
}
