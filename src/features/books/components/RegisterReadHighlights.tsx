import { Button, Input, Textarea } from "@/components/ui";
import type { ReadingInteraction } from "@/features/profile/dtos";
import { useState } from "react";

interface Props {
  interaction: ReadingInteraction;
}

export default function RegisterReadHighlights({ interaction }: Props) {
  const [showRegisterHighlight, setShowRegisterHighlight] = useState(false);
  const [newQuote, setNewQuote] = useState("");
  const [newQuotePage, setNewQuotePage] = useState("");
  const [highlights, setHighlights] = useState(interaction.highlights);

  function saveQuote(): void {
    setHighlights((prev) => [
      ...prev,
      {
        page: Number(newQuotePage),
        percentage: Math.round(
          (Number(newQuotePage) / interaction.total_pages) * 100,
        ),
        quote: newQuote,
      },
    ]);

    setNewQuote("");
    setNewQuotePage("");
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border p-4 rounded-xl mb-7">
        <p className="text-sm font-medium">Destaques</p>
        {highlights.map((highlight, idx) => (
          <div
            key={idx}
            className="bg-gray-200 p-4 border-l-3 border-primary rounded-xl"
          >
            <p className="text-sm">"{highlight.quote}"</p>
            <p className="text-xs text-primary font-medium mt-3">
              pág {highlight.page}
            </p>
          </div>
        ))}

        {showRegisterHighlight && (
          <div className="bg-gray-200 flex flex-col gap-3 p-4 border-l-3 border-primary rounded-xl">
            <Textarea
              className="bg-white"
              placeholder="Citação"
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
            />
            <Input
              className="bg-white"
              placeholder="Número da página"
              value={newQuotePage}
              onChange={(e) => setNewQuotePage(e.target.value)}
            />
            <Button
              className="self-start text-sm text-primary"
              variant="ghost"
              size="sm"
              onClick={() => saveQuote()}
            >
              Salvar
            </Button>
          </div>
        )}

        <Button
          className="self-start text-sm text-primary"
          variant="ghost"
          size="sm"
          onClick={() => setShowRegisterHighlight(!showRegisterHighlight)}
        >
          {showRegisterHighlight ? "Cancelar" : "Adicionar"}
        </Button>
      </div>
    </div>
  );
}
