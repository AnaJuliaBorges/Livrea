import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { reportError } from "./reportError";

// Config global do TanStack Query + funil de erro.
//
// Os handlers de cache rodam para TODA query/mutation, inclusive as que o
// call site ignora silenciosamente — é o que tira as falhas de RPC da
// invisibilidade. Eles só reportam, nunca notificam: as mutations já dão
// toast.error na própria tela (~20 lugares), e um toast global duplicaria a
// mensagem pro usuário.
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        reportError(error, {
          source: "query",
          detail: JSON.stringify(query.queryKey),
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // a maioria das mutations daqui não define mutationKey, então o que
        // identifica o caso costuma ser a stack do próprio erro
        const { mutationKey } = mutation.options;

        reportError(error, {
          source: "mutation",
          detail: mutationKey ? JSON.stringify(mutationKey) : undefined,
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}
