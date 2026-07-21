import { useEffect } from "react";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import { Button } from "@/components/ui";
import { reportError } from "@/lib/reportError";

// errorElement da rota raiz (src/main.tsx): pega erro de render de qualquer
// página, falha de loader e rota inexistente (404), que antes caíam na tela
// padrão do React Router — em inglês e sem nenhum registro.

// Depois de um deploy, o index.html em cache aponta pra chunks com hash
// antigo que não existem mais no servidor, e o import() da rota falha. Não é
// bug: é versão velha aberta na aba: recarregar resolve.
function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);

  return /dynamically imported module|Importing a module script failed/i.test(
    message,
  );
}

export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  const staleChunk = isStaleChunkError(error);
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    // chunk velho e 404 são esperados — reportar só polui o log
    if (staleChunk || notFound) return;

    reportError(error, {
      source: "route",
      detail: window.location.pathname,
    });
  }, [error, staleChunk, notFound]);

  const { title, message } = staleChunk
    ? {
        title: "Nova versão disponível",
        message:
          "O Livrea foi atualizado enquanto você navegava. Recarregue a página pra continuar.",
      }
    : notFound
      ? {
          title: "Página não encontrada",
          message: "O endereço que você tentou abrir não existe.",
        }
      : {
          title: "Algo deu errado",
          message:
            "Tivemos um problema ao carregar esta página. Tente novamente em instantes.",
        };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 pt-24 text-center sm:px-6">
        <h1 className="text-lg font-medium">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {!notFound && (
            <Button onClick={() => window.location.reload()}>
              {staleChunk ? "Recarregar" : "Tentar novamente"}
            </Button>
          )}
          <Button
            variant={notFound ? "default" : "outline"}
            onClick={() => navigate("/")}
          >
            Voltar ao início
          </Button>
        </div>
      </main>
    </div>
  );
}
