import { ContainerBorder } from "@/components/ContainerBorder";
import { Button } from "@/components/ui";
import type { ReadingInteraction } from "@/features/profile/dtos";
import { Star } from "lucide-react";

interface Props {
  interaction: ReadingInteraction;
}

export default function RegisterReadReview({ interaction }: Props) {
  return (
    <div>
      {interaction.review ? (
        <div>
          <ContainerBorder className=" mb-7">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Sua avaliação</p>
              <p className="flex items-center gap-1">
                {interaction.review?.rating ?? "0.0"}
                <Star className="inline-block" size={21} />
              </p>
            </div>
            <p>"{interaction.review?.review}"</p>
            <Button
              className="mt-2 self-start pl-0 text-sm"
              size="sm"
              variant="link"
            >
              Editar avaliação
            </Button>
          </ContainerBorder>
        </div>
      ) : (
        <div className="flex flex-col gap-4 border p-4 items-center rounded-xl mt-7">
          Avaliação ainda não publicada
          <button>Fazer avaliação</button>
        </div>
      )}
    </div>
  );
}
