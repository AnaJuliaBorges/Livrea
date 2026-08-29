import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getWelcomeTourSeen,
  markWelcomeTourSeen,
} from "../services/welcomeTour";

export function useWelcomeTour() {
  const [searchParams, setSearchParams] = useSearchParams();
  const forced = searchParams.get("tour") === "1";

  const [seen, setSeen] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;

    getWelcomeTourSeen()
      .then((value) => active && setSeen(value))
      .catch(() => active && setSeen(true));

    return () => {
      active = false;
    };
  }, []);

  const isOpen = !dismissed && (forced || seen === false);

  const dismiss = useCallback(() => {
    setDismissed(true);

    void markWelcomeTourSeen().catch(() => {});

    if (forced) {
      const next = new URLSearchParams(searchParams);
      next.delete("tour");
      setSearchParams(next, { replace: true });
    }
  }, [forced, searchParams, setSearchParams]);

  return { isOpen, dismiss };
}
