import * as Sentry from "@sentry/react";

// Ponto único por onde passa todo erro não tratado da aplicação: falhas de
// query/mutation (via os caches globais em lib/queryClient.ts) e erros de
// rota (via components/layout/RouteError.tsx).
//
// É o adapter para o Sentry: os call sites falam `{ source, detail }` e não
// conhecem o SDK, então trocar de serviço de erro é mexer só neste arquivo.
// O setup do SDK (DSN, filtros, usuário) fica em lib/sentry.ts.

export interface ErrorContext {
  // de onde veio o erro: "query", "mutation", "route"
  source: "query" | "mutation" | "route";
  // o que identifica o caso: queryKey serializada, pathname da rota...
  detail?: string;
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}

export function reportError(error: unknown, context: ErrorContext): void {
  // `source` como tag (cardinalidade baixa) é o que permite filtrar
  // query/mutation/route no Sentry; `detail` é alto demais pra tag e vai
  // como extra, que é o que se lê ao abrir o evento
  Sentry.captureException(error, {
    tags: { source: context.source },
    extra: { detail: context.detail },
  });

  // em produção o console não serve pra ninguém — quem lê é o Sentry
  if (import.meta.env.DEV) {
    const scope = context.detail
      ? `${context.source} ${context.detail}`
      : context.source;

    console.error(`[${scope}] ${toMessage(error)}`, error);
  }
}
