import { ContainerBorder } from "@/components/ContainerBorder";
import type { Club } from "../dtos";
import { BookImage } from "@/features/books/components/BookImage";
import { useBook } from "@/features/books/hooks/useBook";
import type { BookTemp } from "@/features/books/types/book";
import {
  formatRatingValue,
  getBookRatingDisplay,
} from "@/features/books/utils/bookRating";
import { useClubBookRating } from "../hooks/useClubBookRating";
import {
  BookmarkMinus,
  BookPlus,
  ChevronRight,
  EditIcon,
  NotepadText,
  PencilLine,
  Star,
  ArrowLeft,
  UserRound,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Separator } from "@/components/ui";
import { ProgressRead } from "@/components/ProgressRead";
import { mockClubInteractions, type ClubInteractions } from "@/mocks/clubes";
import { useState } from "react";
import { SetClubReadingModal } from "./SetClubReadingModal";
import { useDeleteClubReading } from "../hooks/useDeleteClubReading";
import { getErrorMessage } from "@/lib/utils";

interface Props {
  club: Club;
}

function HighlightsSection({
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

function ReviewsSection({
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
          <h3 className="text-xs font-medium">Resenhas</h3>
        </button>
      </div>
      {interactions.reviews.map((review) => (
        <ContainerBorder>
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <UserRound size={20} />
              <p className="text-xs font-medium">{review.user.name}</p>
            </div>

            <p className="text-xs flex font-semibold gap-1">
              {review.rating} <Star size={16} />
            </p>
          </div>

          <p className="text-xs">{review.review}</p>
        </ContainerBorder>
      ))}
    </div>
  );
}

function ReadersSection({
  onBack,
  interactions,
}: {
  onBack: () => void;
  interactions: ClubInteractions;
}) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <button
        onClick={onBack}
        className="flex gap-3 items-center p-2 hover:bg-gray-200 rounded-full transition"
      >
        <ArrowLeft size={20} />
        <h3 className="text-xs font-medium">Leitores</h3>
      </button>

      <div className="flex flex-col gap-2">
        {interactions.participantsProgress
          .sort((a, b) => b.progress - a.progress)
          .map((member) => (
            <ContainerBorder className="text-xs flex-row justify-between items-center">
              <div className="flex gap-2 items-center">
                <UserRound size={20} />
                <div className="flex flex-col">
                  <p className="text-xs font-medium">{member.user.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {member.isAdmin
                      ? "Administrador"
                      : `Membro desde ${member.joinedAt}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {member.progress === 100 && (
                  <p className="text-xs flex items-center font-semibold gap-1">
                    {member.rating} <Star size={16} />
                  </p>
                )}
                <p className="text-[10px]">{member.progress}% lido</p>
              </div>
            </ContainerBorder>
          ))}
      </div>
    </div>
  );
}

// Mesmo card usado pra leitura atual, reaproveitado pra cada item do
// histórico — cada instância busca seu próprio livro via useBook.
function BookReadingCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate();
  const { data: book, isLoading } = useBook(bookId);

  if (isLoading) {
    return (
      <ContainerBorder className="items-center text-xs text-muted-foreground">
        Carregando livro...
      </ContainerBorder>
    );
  }

  return (
    <div onClick={() => navigate(`/livros/${bookId}`)}>
      <ContainerBorder className="flex-row items-center gap-3">
        <BookImage
          book={book}
          height="h-28"
          className="w-20 shrink-0 object-cover"
        />
        <div className="text-xs flex-1 min-w-0">
          <p className="font-medium">
            {book?.title_pt ?? book?.title_original}
          </p>
          <p>{book?.authors.join(", ")}</p>
          <p>{book?.publisher}</p>
          <p>{book?.primary_genre?.name}</p>
          {Boolean(book?.total_pages) && <p>{book?.total_pages} páginas</p>}
        </div>
        <ChevronRight className="shrink-0" />
      </ContainerBorder>
    </div>
  );
}

// Box "Avaliação do livro", reaproveitado pra leitura atual e pra cada item
// do histórico:
//   Global — média geral do livro (local do banco > global do Google > 0.0)
//   Clube — média das notas dos membros do clube pro livro (ao vivo)
//   Individual — a nota do próprio usuário pro livro
function BookRatingBox({
  book,
  clubId,
  bookId,
  onSelectTab,
  text = "dos participantes já leram o livro",
}: {
  book: BookTemp | undefined;
  clubId: string;
  bookId: string;
  onSelectTab: (tab: string) => void;
  text?: string;
}) {
  const { data: rating } = useClubBookRating(clubId, bookId);

  return (
    <ContainerBorder className="text-xs">
      <p className="font-medium ">Avaliação do livro</p>
      <Separator />
      <p className="flex justify-between">
        <span className="flex gap-1">
          Global: {getBookRatingDisplay(book)} <Star size={16} />
        </span>{" "}
        |{" "}
        <span className="flex gap-1">
          Clube: {formatRatingValue(rating?.clubAverage)} <Star size={16} />
        </span>{" "}
        |{" "}
        <span className="flex gap-1">
          Individual: {formatRatingValue(rating?.myRating)} <Star size={16} />
        </span>
      </p>
      <div className="flex justify-between gap-2">
        <button onClick={() => onSelectTab("highlights")} className="w-full">
          <ContainerBorder className="flex-1 gap-1 items-center">
            <PencilLine />
            <p className="text-[10px]">Destaques</p>
          </ContainerBorder>
        </button>
        <button onClick={() => onSelectTab("reviews")} className="w-full">
          <ContainerBorder className="flex-1 gap-1 items-center">
            <BookmarkMinus />
            <p className="text-[10px]">Resenhas</p>
          </ContainerBorder>
        </button>
        <button onClick={() => onSelectTab("readers")} className="w-full">
          <ContainerBorder className="flex-1 gap-1 items-center">
            <NotepadText />
            <p className="text-[10px]">Leitores</p>
          </ContainerBorder>
        </button>
      </div>
      <Separator />
      <div className="w-full flex flex-col gap-2 items-center mt-0">
        <ProgressRead value={78} label="" />
        <p>{text}</p>
      </div>
    </ContainerBorder>
  );
}

// Card do histórico completo (capa/dados + avaliação), pra cada leitura
// passada do clube.
function PastReadingItem({
  clubId,
  bookId,
  isMember,
  onSelectTab,
}: {
  clubId: string;
  bookId: string;
  isMember: boolean;
  onSelectTab: (tab: string) => void;
}) {
  const { data: book } = useBook(bookId);

  return (
    <div className="flex flex-col gap-2">
      <BookReadingCard bookId={bookId} />
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

export default function ReadingSection({ club }: Props) {
  const { data: book, isLoading: isLoadingBook } = useBook(
    club.currentReading?.id,
  );
  const interactions = mockClubInteractions;

  const [activeTab, setActiveTab] = useState("");
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showDeleteReadingModal, setShowDeleteReadingModal] = useState(false);

  const navigate = useNavigate();
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

  if (activeTab === "highlights") {
    return (
      <HighlightsSection
        interactions={interactions}
        onBack={() => setActiveTab("")}
      />
    );
  }

  if (activeTab === "reviews") {
    return (
      <ReviewsSection
        onBack={() => setActiveTab("")}
        interactions={interactions}
      />
    );
  }

  if (activeTab === "readers") {
    return (
      <ReadersSection
        onBack={() => setActiveTab("")}
        interactions={interactions}
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
            onSelectTab={setActiveTab}
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

        {isLoadingBook ? (
          <ContainerBorder className="mt-2 items-center text-xs text-muted-foreground">
            Carregando livro...
          </ContainerBorder>
        ) : (
          <div onClick={() => navigate(`/livros/${club.currentReading?.id}`)}>
            <ContainerBorder className="flex-row items-center gap-3 mt-2">
              <BookImage
                book={book}
                height="h-28"
                className="w-20 shrink-0 object-cover"
              />
              <div className="text-xs flex-1 min-w-0">
                <p className="font-medium">
                  {book?.title_pt ?? book?.title_original}
                </p>
                <p>{book?.authors.join(", ")}</p>
                <p>{book?.publisher}</p>
                <p>{book?.primary_genre?.name}</p>
                {Boolean(book?.total_pages) && (
                  <p>{book?.total_pages} páginas</p>
                )}
              </div>
              <ChevronRight className="shrink-0" />
            </ContainerBorder>
          </div>
        )}
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
          onSelectTab={setActiveTab}
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
