import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { formatDateString } from "../utils/formatDate";
import { ProgressRead } from "@/components/ProgressRead";
import { ContainerBorder } from "@/components/ContainerBorder";
import { useSaveReadingProgress } from "../hooks/useReadingTracking";
import type {
  ReadingFeeling,
  ReadingLogEntry,
} from "../services/readingTracking";

interface Props {
  bookId: string;
  totalPages: number;
  lastProgress: number;
  logs: ReadingLogEntry[];
}

const feelings: { label: ReadingFeeling; emoji: string }[] = [
  { label: "não curti", emoji: "☹️​" },
  { label: "meh", emoji: "🙁​" },
  { label: "ok", emoji: "😐​" },
  { label: "gostei", emoji: "🙂​" },
  { label: "amei", emoji: "😁" },
];

export default function RegisterReadHistory({
  bookId,
  totalPages,
  lastProgress,
  logs,
}: Props) {
  const [feelingSelected, setFeelingSelected] = useState<ReadingFeeling | "">(
    "",
  );
  const [currentPage, setCurrentPage] = useState(lastProgress);

  // após salvar, o progresso confirmado pelo servidor vira a nova base
  // (ajuste de estado durante o render, sem efeito)
  const [prevLastProgress, setPrevLastProgress] = useState(lastProgress);
  if (prevLastProgress !== lastProgress) {
    setPrevLastProgress(lastProgress);
    setCurrentPage(lastProgress);
  }

  const { mutateAsync: saveProgress, isPending } =
    useSaveReadingProgress(bookId);

  const finished = totalPages > 0 && lastProgress >= totalPages;

  async function handleSave() {
    if (!feelingSelected) return;

    try {
      await saveProgress({ currentPage, feeling: feelingSelected });
      setFeelingSelected("");
      toast.success("Registro salvo!");
    } catch {
      toast.error("Não foi possível salvar o registro. Tente novamente.");
    }
  }

  function getDetails(log: ReadingLogEntry) {
    const date = formatDateString(log.created_at);
    const feeling = feelings.find((feeling) => feeling.label === log.feeling);
    const pages = log.pages_read;
    const percentage =
      totalPages > 0 ? Math.round((pages / totalPages) * 100) : 0;

    return { date, feeling, pages, percentage };
  }

  return (
    <div className="mb-16">
      {!finished && (
        <ContainerBorder>
          <p className="text-sm font-medium">Progresso da leitura</p>
          <div className="flex flex-col gap-5 bg-gray-200 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Página atual</p>
              <div className="flex gap-2 items-center">
                <Button
                  className="bg-white text-primary font-semibold rounded-xl"
                  onClick={() => setCurrentPage((prev: number) => prev - 1)}
                  disabled={currentPage <= 0}
                >
                  -
                </Button>

                <p>
                  <span className="text-xl font-bold">{currentPage}</span>/
                  <span className="text-xs font-medium">{totalPages}</span>
                </p>

                <Button
                  className="bg-white text-primary font-semibold rounded-xl"
                  onClick={() => setCurrentPage((prev: number) => prev + 1)}
                  disabled={totalPages > 0 && currentPage >= totalPages}
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
          <Button
            variant="default"
            disabled={!feelingSelected || isPending}
            onClick={handleSave}
          >
            {isPending ? "Salvando..." : "Salvar registro"}
          </Button>
        </ContainerBorder>
      )}

      <div className="flex flex-col gap-4 mt-4 mb-8">
        <p className="text-sm font-medium">Histórico de leitura</p>

        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Nenhum registro ainda. Salve seu primeiro progresso!
          </p>
        )}

        {logs.map((log) => {
          const detail = getDetails(log);
          return (
            <ContainerBorder key={log.id}>
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
