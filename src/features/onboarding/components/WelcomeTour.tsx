import { useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import { useWelcomeTour } from "../hooks/useWelcomeTour";
import { welcomeTourSteps } from "../model/steps";

/**
 * Modal de boas-vindas mostrado no primeiro acesso do shell logado.
 * Mesmo padrão do ConfirmDialog (overlay fixo próprio, sem Radix Dialog).
 */
export function WelcomeTour() {
  const { isOpen, dismiss } = useWelcomeTour();
  const [index, setIndex] = useState(0);

  if (!isOpen) return null;

  const step = welcomeTourSteps[index];
  const Icon = step.icon;
  const isLast = index === welcomeTourSteps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-tour-title"
    >
      <div className="flex w-full max-w-md flex-col gap-5 rounded-t-2xl bg-white p-6 shadow-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismiss}
            aria-label="Fechar tour"
          >
            <X className="size-5 text-[#A2A2A2]" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h2 id="welcome-tour-title" className="text-xl font-semibold">
            {step.title}
          </h2>
          <p className="text-sm text-[#5b5b5b]">{step.description}</p>
        </div>

        <ul className="flex flex-col gap-2">
          {step.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm">
              <Check className="mt-1 size-4 shrink-0 text-success" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-center gap-2">
          {welcomeTourSteps.map((it, i) => (
            <span
              key={it.id}
              data-testid="welcome-tour-dot"
              data-active={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-2 bg-border",
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          {index === 0 ? (
            <Button variant="ghost" onClick={dismiss}>
              Pular
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setIndex(index - 1)}>
              Voltar
            </Button>
          )}

          <Button
            onClick={() => (isLast ? dismiss() : setIndex(index + 1))}
            variant="ghost"
            className="text-primary"
          >
            {isLast ? "Começar a ler" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
