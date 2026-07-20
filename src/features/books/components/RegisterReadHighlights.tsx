import { ContainerBorder } from "@/components/shared/ContainerBorder";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button, Input, Textarea } from "@/components/ui";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteHighlight,
  useSaveHighlight,
  useUpdateHighlight,
} from "../hooks/useReadingTracking";
import type { BookHighlightEntry } from "../services/readingTracking";

interface Props {
  bookId: string;
  highlights: BookHighlightEntry[];
}

export default function RegisterReadHighlights({ bookId, highlights }: Props) {
  const [showRegisterHighlight, setShowRegisterHighlight] = useState(false);
  const [newQuote, setNewQuote] = useState("");
  const [newQuotePage, setNewQuotePage] = useState("");

  // edição inline: id do destaque em edição e os valores do formulário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuote, setEditQuote] = useState("");
  const [editPage, setEditPage] = useState("");

  const { mutateAsync: saveHighlight, isPending: isSaving } =
    useSaveHighlight(bookId);
  const { mutateAsync: updateHighlight, isPending: isUpdating } =
    useUpdateHighlight(bookId);
  const deleteHighlight = useDeleteHighlight(bookId);
  const [highlightToDelete, setHighlightToDelete] = useState<string | null>(
    null,
  );

  const handleDelete = () => {
    if (!highlightToDelete) return;

    deleteHighlight.mutate(highlightToDelete, {
      onSuccess: () => {
        setHighlightToDelete(null);
        toast.success("Destaque excluído.");
      },
      onError: (error) => {
        console.error("Error deleting highlight:", error);
        toast.error("Não foi possível excluir o destaque. Tente novamente.");
      },
    });
  };

  async function saveQuote() {
    try {
      await saveHighlight({
        page: Number(newQuotePage),
        quote: newQuote.trim(),
      });

      setNewQuote("");
      setNewQuotePage("");
      setShowRegisterHighlight(false);
      toast.success("Destaque salvo!");
    } catch {
      toast.error("Não foi possível salvar o destaque. Tente novamente.");
    }
  }

  function startEditing(highlight: BookHighlightEntry) {
    setEditingId(highlight.id);
    setEditQuote(highlight.quote);
    setEditPage(String(highlight.page));
  }

  async function saveEdit() {
    if (!editingId) return;

    try {
      await updateHighlight({
        highlightId: editingId,
        page: Number(editPage),
        quote: editQuote.trim(),
      });

      setEditingId(null);
      toast.success("Destaque atualizado!");
    } catch {
      toast.error("Não foi possível atualizar o destaque. Tente novamente.");
    }
  }

  return (
    <div>
      <ContainerBorder className="mb-7">
        <p className="text-sm font-medium">Destaques</p>

        {highlights.length === 0 && !showRegisterHighlight && (
          <p className="text-sm text-muted-foreground text-center">
            Nenhum destaque ainda.
          </p>
        )}

        {highlights.map((highlight) =>
          editingId === highlight.id ? (
            <div
              key={highlight.id}
              className="bg-gray-200 flex flex-col gap-3 p-4 border-l-3 border-secondary rounded-xl"
            >
              <Textarea
                className="bg-white"
                placeholder="Citação"
                value={editQuote}
                onChange={(e) => setEditQuote(e.target.value)}
              />
              <Input
                className="bg-white"
                placeholder="Número da página"
                type="number"
                value={editPage}
                onChange={(e) => setEditPage(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  className="self-start text-sm text-secondary"
                  variant="ghost"
                  size="sm"
                  disabled={!editQuote.trim() || !editPage || isUpdating}
                  onClick={saveEdit}
                >
                  {isUpdating ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  className="self-start text-sm"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={highlight.id}
              className="bg-gray-200 p-4 border-l-3 border-primary rounded-xl"
            >
              <p className="text-sm">"{highlight.quote}"</p>
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-primary font-medium">
                  pág {highlight.page}
                </p>
                <div className="flex gap-3">
                  <Button
                    className="text-xs text-primary h-auto p-0"
                    variant="link"
                    size="sm"
                    onClick={() => startEditing(highlight)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="text-xs text-destructive h-auto p-0"
                    variant="link"
                    size="sm"
                    disabled={deleteHighlight.isPending}
                    onClick={() => setHighlightToDelete(highlight.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ),
        )}

        {showRegisterHighlight && (
          <div className="bg-gray-200 flex flex-col gap-3 p-4 border-l-3 border-secondary rounded-xl">
            <Textarea
              className="bg-white"
              placeholder="Citação"
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
            />
            <Input
              className="bg-white"
              placeholder="Número da página"
              type="number"
              value={newQuotePage}
              onChange={(e) => setNewQuotePage(e.target.value)}
            />
            <Button
              className="self-start text-sm text-secondary"
              variant="ghost"
              size="sm"
              disabled={!newQuote.trim() || !newQuotePage || isSaving}
              onClick={saveQuote}
            >
              {isSaving ? "Salvando..." : "Salvar"}
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
      </ContainerBorder>

      {highlightToDelete && (
        <ConfirmDialog
          title="Excluir destaque"
          description="Esse destaque será apagado. Essa ação não pode ser desfeita."
          isPending={deleteHighlight.isPending}
          onConfirm={handleDelete}
          onClose={() => setHighlightToDelete(null)}
        />
      )}
    </div>
  );
}
