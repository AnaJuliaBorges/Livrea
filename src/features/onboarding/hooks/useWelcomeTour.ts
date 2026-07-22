import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getWelcomeTourSeen,
  markWelcomeTourSeen,
} from "../services/welcomeTour";

/**
 * Controla a exibição do tour de boas-vindas: abre uma única vez por
 * **usuário** (flag em profiles.welcome_tour_seen, ver services/welcomeTour)
 * e fica
 * disponível pra reabrir com `?tour=1` na URL (o link que mandamos pra quem
 * está testando).
 *
 * O AppLayout — e portanto este hook — remonta a cada entrada no shell
 * logado, então a leitura da sessão no efeito reavalia a cada login: a conta
 * que já viu não vê de novo, mas outra conta no mesmo navegador vê.
 */
export function useWelcomeTour() {
  const [searchParams, setSearchParams] = useSearchParams();
  const forced = searchParams.get("tour") === "1";

  // null = ainda carregando; enquanto isso não mostramos (evita piscar o tour
  // para quem já viu). `forced` ignora esse gate e abre na hora.
  const [seen, setSeen] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;

    getWelcomeTourSeen()
      // falha ao ler a sessão: trata como visto, o tour é enfeite e não deve
      // aparecer por engano
      .then((value) => active && setSeen(value))
      .catch(() => active && setSeen(true));

    return () => {
      active = false;
    };
  }, []);

  const isOpen = !dismissed && (forced || seen === false);

  const dismiss = useCallback(() => {
    setDismissed(true);

    // fire-and-forget: gravar a flag falhar (offline, etc.) no máximo faz o
    // tour reaparecer num próximo acesso — nunca quebra a tela
    void markWelcomeTourSeen().catch(() => {});

    if (forced) {
      // tira o ?tour=1 da URL, senão um refresh (ou o link compartilhado de
      // novo) reabre o tour pra sempre
      const next = new URLSearchParams(searchParams);
      next.delete("tour");
      setSearchParams(next, { replace: true });
    }
  }, [forced, searchParams, setSearchParams]);

  return { isOpen, dismiss };
}
