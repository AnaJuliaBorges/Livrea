import { ContainerBorder } from "@/components/ContainerBorder";
import type { ClubInteractions } from "@/mocks/clubes";
import { ArrowLeft } from "lucide-react";

export function HighlightsSection({
  onBack,
  interactions,
}: {
  onBack: () => void;
  interactions: ClubInteractions;
}) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft size={20} />
          <h3 className="text-xs font-medium">Destaques</h3>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {interactions.highlights.map((highlight) => (
          <ContainerBorder className="text-xs">
            "{highlight.text}"
            <div className="flex justify-between">
              <p>Página {highlight.page}</p>
              <p className="font-semibold">
                {highlight.highlightCount} marcações
              </p>
            </div>
          </ContainerBorder>
        ))}
      </div>
    </div>
  );
}
