import type { Club } from "../../dtos";
import { useBook } from "@/features/books/hooks/useBook";
import { BookPlus, EditIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { mockClubInteractions } from "@/mocks/clubes";
import { useState } from "react";
import { SetClubReadingModal } from "../SetClubReadingModal";
import { useDeleteClubReading } from "../../hooks/useDeleteClubReading";
import { getErrorMessage } from "@/lib/utils";
import { BookRatingBox } from "./BookRatingBox";
import { BookReadingCard } from "./BookReadingCard";
import { HighlightsSection } from "./HighlightsSection";
import { PastReadingItem } from "./PastReadingItem";
import { ReadersSection } from "./ReadersSection";
import { ReviewsSection } from "./ReviewsSection";

interface Props {
  club: Club;
}

export default function ReadingSection({ club }: Props) {
  // O livro da leitura atual também é usado aqui (BookRatingBox + modal de
  // exclusão); o React Query deduplica com o useBook do BookReadingCard.
  const { data: book } = useBook(club.currentReading?.id);
  const interactions = mockClubInteractions;

  // Qual sub-tela está aberta e sobre QUAL livro (leitura atual ou uma
  // leitura passada do histórico) — sem o bookId as sub-telas não sabem
  // de que livro mostrar os dados.
  const [activeView, setActiveView] = useState<{
    tab: string;
    bookId: string;
  } | null>(null);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showDeleteReadingModal, setShowDeleteReadingModal] = useState(false);

  const deleteReading = useDeleteClubReading(club.id);

  const handleDeleteReading = () => {
    deleteReading.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteReadingModal(false);
        toast.success("Leitura atual removida.");
      },
      onError: (error) => {
        console.error("Error deleting club reading:", error);
        toast.error(
          getErrorMessage(error) ??
            "Não foi possível excluir a leitura. Tente novamente.",
        );
      },
    });
  };

  if (activeView?.tab === "highlights") {
    return (
      <HighlightsSection
        interactions={interactions}
        onBack={() => setActiveView(null)}
      />
    );
  }

  if (activeView?.tab === "reviews") {
    return (
      <ReviewsSection
        clubId={club.id}
        bookId={activeView.bookId}
        onBack={() => setActiveView(null)}
      />
    );
  }

  if (activeView?.tab === "readers") {
    return (
      <ReadersSection
        clubId={club.id}
        bookId={activeView.bookId}
        onBack={() => setActiveView(null)}
      />
    );
  }

  const pastReadings = club.readingHistory.length > 0 && (
    <div>
      <p className="font-medium text-xs mb-2">Leituras anteriores</p>
      <div className="flex flex-col gap-4">
        {club.readingHistory.map((pastBook) => (
          <PastReadingItem
            key={pastBook.id}
            clubId={club.id}
            bookId={pastBook.id}
            isMember={club.isMember}
            onSelectTab={(tab) => setActiveView({ tab, bookId: pastBook.id })}
          />
        ))}
      </div>
    </div>
  );

  // Sem leitura atual: admin vê o botão pra definir; participante, um aviso.
  // O histórico continua aparecendo mesmo sem leitura atual definida.
  if (!club.currentReading) {
    return (
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <BookPlus size={48} className="text-gray-300" />
          <p className="text-sm text-muted-foreground">
            O clube ainda não tem uma leitura atual.
          </p>

          {club.isAdmin && (
            <Button onClick={() => setShowReadingModal(true)}>
              Adicionar leitura do clube
            </Button>
          )}

          {showReadingModal && (
            <SetClubReadingModal
              clubId={club.id}
              onClose={() => setShowReadingModal(false)}
            />
          )}
        </div>

        {pastReadings}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div>
        <div className="flex items-center justify-between">
          <p className="font-medium text-xs">Leitura atual</p>
          {club.isAdmin && (
            <div className="flex gap-4">
              <button
                type="button"
                aria-label="Trocar leitura do clube"
                onClick={() => setShowReadingModal(true)}
              >
                <EditIcon size={16} />
              </button>
              <button
                className=" text-destructive"
                aria-label="Remover leitura atual do clube"
                onClick={() => setShowDeleteReadingModal(true)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-2">
          <BookReadingCard bookId={club.currentReading.id} />
        </div>
      </div>

      {showReadingModal && (
        <SetClubReadingModal
          clubId={club.id}
          onClose={() => setShowReadingModal(false)}
        />
      )}

      {club.isMember && club.currentReading && (
        <BookRatingBox
          book={book}
          clubId={club.id}
          bookId={club.currentReading.id}
          onSelectTab={(tab) =>
            setActiveView({ tab, bookId: club.currentReading!.id })
          }
        />
      )}

      {pastReadings}

      {showDeleteReadingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-medium">Excluir leitura atual</h2>

            <p className="text-sm text-muted-foreground">
              Isso remove "{book?.title_pt ?? book?.title_original}" da leitura
              atual sem levá-la pro histórico. Se quiser arquivá-la, use "Marcar
              encontro como concluído" na aba Overview.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="link"
                onClick={() => setShowDeleteReadingModal(false)}
                disabled={deleteReading.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteReading}
                disabled={deleteReading.isPending}
              >
                {deleteReading.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
