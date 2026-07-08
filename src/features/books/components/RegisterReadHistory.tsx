import { Button } from "@/components/ui";
import type { ReadingInteraction, ReadingLog } from "@/features/profile/dtos";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDateString } from "../utils/formatDate";
import { ProgressRead } from "@/components/ProgressRead";
import { ContainerBorder } from "@/components/ContainerBorder";

interface Props {
  interaction: ReadingInteraction;
}

export default function RegisterReadHistory({ interaction }: Props) {
  const [feelingSelected, setFeelingSelected] = useState("");
  const [currentPage, setCurrentPage] = useState(interaction.last_progress);

  const feelings = [
    { label: "não curti", emoji: "☹️​" },
    { label: "meh", emoji: "🙁​" },
    { label: "ok", emoji: "😐​" },
    { label: "gostei", emoji: "🙂​" },
    { label: "amei", emoji: "😁" },
  ];

  function getDetails(log: ReadingLog) {
    const date = formatDateString(log.created_at);
    const feeling = feelings.find((feeling) => feeling.label === log.feeling);
    const pages = log.pages_read;
    const percentage = Math.round(
      (Number(pages) / interaction.total_pages) * 100,
    );

    return { date, feeling, pages, percentage };
  }

  return (
    <div>
      {interaction.total_pages !== interaction.last_progress && (
        <ContainerBorder>
          <p className="text-sm font-medium">Progresso da leitura</p>
          <div className="flex flex-col gap-5 bg-gray-200 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Página atual</p>
              <div className="flex gap-2 items-center">
                <Button
                  className="bg-white text-primary font-semibold rounded-xl"
                  onClick={() => setCurrentPage((prev: number) => prev - 1)}
                  disabled={currentPage == 1}
                >
                  -
                </Button>

                <p>
                  <span className="text-xl font-bold">{currentPage}</span>/
                  <span className="text-xs font-medium">
                    {interaction.total_pages}
                  </span>
                </p>

                <Button
                  className="bg-white text-primary font-semibold rounded-xl"
                  onClick={() => setCurrentPage((prev: number) => prev + 1)}
                  disabled={currentPage == interaction.total_pages}
                >
                  +
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Como você se sentiu? </p>
              <div className="flex justify-between">
                {feelings.map((feeling) => (
                  <div
                    key={feeling.label}
                    className="flex flex-col gap-1 items-center"
                  >
                    <Button
                      className={cn(
                        "bg-gray-100 rounded-xl text-xl py-5 px-2 opacity-60",
                        feelingSelected === feeling.label &&
                          "bg-primary opacity-100",
                      )}
                      onClick={() => setFeelingSelected(feeling.label)}
                    >
                      {feeling.emoji}
                    </Button>
                    <p className="text-xs">{feeling.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button variant="default">Salvar registro</Button>
        </ContainerBorder>
      )}

      <div className="flex flex-col gap-4 mt-4 mb-8">
        <p className="text-sm font-medium">Histórico de leitura</p>

        {interaction.reading_logs.map((log) => {
          const detail = getDetails(log);
          return (
            <ContainerBorder>
              <div className="flex justify-between items-center">
                <p className="text-xl">{detail.feeling?.emoji}</p>
                <p className="text-sm text-gray-600">{detail.date}</p>
              </div>
              <div className="flex flex-col gap-2">
                <ProgressRead value={detail.percentage} />
                <span className="text-xs text-gray-500">
                  {detail.pages} páginas lidas
                </span>
              </div>
            </ContainerBorder>
          );
        })}
      </div>
    </div>
  );
}
