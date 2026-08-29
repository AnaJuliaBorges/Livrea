import * as Sentry from "@sentry/react";
import { supabase } from "./supabase";

const NETWORK_ERROR_PATTERN =
  /Failed to fetch|NetworkError|Load failed|network request failed/i;

function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return NETWORK_ERROR_PATTERN.test(message);
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn || !import.meta.env.PROD) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    enableLogs: true,
    integrations: [Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      return isNetworkError(hint.originalException) ? null : event;
    },
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    Sentry.setUser(session ? { id: session.user.id } : null);
  });
}
