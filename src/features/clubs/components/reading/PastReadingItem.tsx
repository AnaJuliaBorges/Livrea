import { useState } from "react";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Button, Textarea } from "@/components/ui";
import { useBook } from "@/features/books";
import { useSetClubReadingNote } from "../../hooks/useSetClubReadingNote";
import { BookRatingBox } from "./BookRatingBox";
import { BookReadingCard } from "./BookReadingCard";

export function PastReadingItem({
  clubId,
  bookId,
  readingId,
  note,
  isMember,
  isAdmin,
  onSelectTab,
}: {
  clubId: string;
  bookId: string;
  readingId: string;
  note: string | null;
  isMember: boolean;
  isAdmin: boolean;
  onSelectTab: (tab: string) => void;
}) {
  const { data: book } = useBook(bookId);
  const setNote = useSetClubReadingNote(clubId);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? "");

  const handleSaveNote = () => {
    setNote.mutate(
      { readingId, note: draft },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Nota da leitura salva!");
        },
        onError: (error) => {
          console.error("Error saving club reading note:", error);
          toast.error("Não foi possível salvar a nota. Tente novamente.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <BookReadingCard bookId={bookId} />

      {/* nota do clube: todos leem; só admin escreve */}
      {(note || isAdmin) && (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Nota do clube</p>
            {isAdmin && !isEditing && (
              <button
                type="button"
                aria-label="Editar nota da leitura"
                onClick={() => {
                  setDraft(note ?? "");
                  setIsEditing(true);
                }}
              >
                <PencilLine size={14} />
              </button>
            )}
          </div>

          {isEditing ? (
            <>
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Como foi essa leitura pro clube?"
                className="min-h-20 text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={setNote.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={setNote.isPending}
                >
                  {setNote.isPending ? "Salvando..." : "Salvar nota"}
                </Button>
              </div>
            </>
          ) : note ? (
            <p className="whitespace-pre-wrap text-sm text-gray-700">{note}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma nota sobre esta leitura ainda.
            </p>
          )}
        </div>
      )}

      {isMember && (
        <BookRatingBox
          book={book}
          clubId={clubId}
          bookId={bookId}
          onSelectTab={onSelectTab}
          text="dos participantes leram o livro"
        />
      )}
    </div>
  );
}
