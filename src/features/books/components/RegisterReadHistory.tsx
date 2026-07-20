import { Button, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDateString } from "@/lib/dates";
import { ProgressRead } from "@/components/ProgressRead";
import { ContainerBorder } from "@/components/ContainerBorder";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useDeleteReadingLog,
  useSaveReadingProgress,
} from "../hooks/useReadingTracking";
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
  const [note, setNote] = useState("");
  const [currentPage, setCurrentPage] = useState(lastProgress);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState(String(lastProgress));

  // após salvar, o progresso confirmado pelo servidor vira a nova base
  // (ajuste de estado durante o render, sem efeito)
  const [prevLastProgress, setPrevLastProgress] = useState(lastProgress);
  if (prevLastProgress !== lastProgress) {
    setPrevLastProgress(lastProgress);
    setCurrentPage(lastProgress);
  }

  const { mutateAsync: saveProgress, isPending } =
    useSaveReadingProgress(bookId);
  const deleteLog = useDeleteReadingLog(bookId);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  const finished = totalPages > 0 && lastProgress >= totalPages;

  const handleDeleteLog = () => {
    if (!logToDelete) return;

    deleteLog.mutate(logToDelete, {
      onSuccess: () => {
        setLogToDelete(null);
        toast.success("Registro excluído.");
      },
      onError: (error) => {
        console.error("Error deleting reading log:", error);
        toast.error("Não foi possível excluir o registro. Tente novamente.");
      },
    });
  };

  async function handleSave() {
    if (!feelingSelected) return;

    try {
      await saveProgress({ currentPage, feeling: feelingSelected, note });
      setFeelingSelected("");
      setNote("");
      toast.success("Registro salvo!");
    } catch {
      toast.error("Não foi possível salvar o registro. Tente novamente.");
    }
  }

  function commitPageInput() {
    const parsed = Number(pageInput);
    if (Number.isInteger(parsed)) {
      const max = totalPages > 0 ? totalPages : Infinity;
      setCurrentPage(Math.min(Math.max(parsed, 0), max));
    }
    setIsEditingPage(false);
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

                {isEditingPage ? (
                  <Input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    min={0}
                    max={totalPages > 0 ? totalPages : undefined}
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value)}
                    onBlur={commitPageInput}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitPageInput();
                      }
                      if (event.key === "Escape") {
                        setIsEditingPage(false);
                      }
                    }}
                    className="h-8 w-16 px-2 py-1 text-center text-sm"
                  />
                ) : (
                  <p
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setPageInput(String(currentPage));
                      setIsEditingPage(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        setPageInput(String(currentPage));
                        setIsEditingPage(true);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="text-xl font-bold">{currentPage}</span>/
                    <span className="text-xs font-medium">{totalPages}</span>
                  </p>
                )}

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
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Anotação (opcional): o que achou desse trecho?"
                className="min-h-20 bg-white"
              />
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
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">{detail.date}</p>
                  <button
                    type="button"
                    aria-label="Excluir registro"
                    className="text-destructive disabled:opacity-50"
                    disabled={deleteLog.isPending}
                    onClick={() => setLogToDelete(log.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {log.note && (
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    "{log.note}"
                  </p>
                )}
                <ProgressRead value={detail.percentage} />
                <span className="text-xs text-gray-500">
                  {detail.pages} páginas lidas
                </span>
              </div>
            </ContainerBorder>
          );
        })}
      </div>

      {logToDelete && (
        <ConfirmDialog
          title="Excluir registro"
          description="Esse registro de progresso será apagado e a página atual voltará pro maior progresso restante. Essa ação não pode ser desfeita."
          isPending={deleteLog.isPending}
          onConfirm={handleDeleteLog}
          onClose={() => setLogToDelete(null)}
        />
      )}
    </div>
  );
}
