import { ContainerBorder } from "@/components/ContainerBorder";
import type { Club } from "../dtos";
import { LocalizationPin } from "@/components/LocalizationPin";
import { EditIcon, UsersRound } from "lucide-react";
import { Button } from "@/components/ui";
import { BookImage } from "@/features/books/components/BookImage";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MeetingTypeTag } from "./MeetingTypeTag";
import { EditMeetingsModal } from "./EditMeetingsModal";
import { MeetingAttendanceModal } from "./MeetingAttendanceModal";
import { useConfirmMeetingAttendance } from "../hooks/useConfirmMeetingAttendance";
import { useCompleteClubReading } from "../hooks/useCompleteClubReading";
import { getErrorMessage } from "@/lib/utils";

interface Props {
  club: Club;
}

// nextMeeting.date vem como "YYYY-MM-DD" puro (sem hora/timezone) da RPC —
// reformata por string em vez de `new Date()` pra não sofrer o bug clássico
// de fuso (UTC-3 "voltaria" um dia na conversão)
function toBrazilianDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
}

const frequencyLabels: Record<string, string> = {
  weekly: "Semanais",
  biweekly: "Quinzenais",
  monthly: "Mensais",
  bimonthly: "Bimestrais",
};

function frequencyLabel(club: Club) {
  if (club.frequency === "custom") {
    return club.customFrequency || "Frequência personalizada";
  }

  return club.frequency
    ? (frequencyLabels[club.frequency] ?? club.frequency)
    : null;
}

type EditingField = "meetings" | null;

export default function OverviewSection({ club }: Props) {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showCompleteReadingModal, setShowCompleteReadingModal] =
    useState(false);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const confirmAttendance = useConfirmMeetingAttendance(club.id);
  const completeReading = useCompleteClubReading(club.id);

  const nextMeeting = club.nextMeeting;

  const handleConfirmAttendance = () => {
    if (!nextMeeting) return;

    confirmAttendance.mutate(nextMeeting.id, {
      onSuccess: () => {
        setShowConfirmModal(false);
        toast.success("Presença confirmada no encontro!");
      },
      onError: () => {
        toast.error("Não foi possível confirmar presença. Tente novamente.");
      },
    });
  };

  const handleCompleteReading = () => {
    completeReading.mutate(undefined, {
      onSuccess: () => {
        setShowCompleteReadingModal(false);
        toast.success("Encontro concluído! O livro foi pro histórico.");
      },
      onError: (error) => {
        console.error("Error completing club reading:", error);
        toast.error(
          getErrorMessage(error) ??
            "Não foi possível concluir o encontro. Tente novamente.",
        );
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <ContainerBorder className="text-sm gap-2">
        <p className="font-medium">Descrição</p>
        <p className="whitespace-pre-wrap">
          {club.description || "Este clube ainda não tem descrição."}
        </p>
      </ContainerBorder>

      <ContainerBorder className="text-sm gap-2">
        <p className="font-medium">Regras de participação</p>
        <p className="whitespace-pre-wrap">
          {club.rules || "Este clube ainda não definiu regras."}
        </p>
      </ContainerBorder>

      <ContainerBorder className="text-sm gap-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-medium">Encontros</p>
          <div className="flex gap-2 items-center">
            <MeetingTypeTag type={club.type} />
            {club.isAdmin && (
              <button
                type="button"
                aria-label="Editar encontros"
                onClick={() => setEditingField("meetings")}
              >
                <EditIcon size={16} />
              </button>
            )}
          </div>
        </div>
        {frequencyLabel(club) && <p>{frequencyLabel(club)}</p>}
        <p className="whitespace-pre-wrap">{club.meetingDescription}</p>

        {nextMeeting ? (
          <>
            <p>
              Próximo encontro: {toBrazilianDate(nextMeeting.date)},{" "}
              {nextMeeting.location} às {nextMeeting.time}
            </p>
            <div className="flex justify-between mt-2">
              <LocalizationPin
                state={club.stateAbbreviation}
                city={club.cityName}
                size="text-xs"
              />
              <button
                type="button"
                className="flex items-center gap-2"
                onClick={() => setShowAttendanceModal(true)}
              >
                {nextMeeting.confirmedMembers}/{club.totalParticipants}{" "}
                <UsersRound size={14} />
              </button>
            </div>
            {club.isMember && (
              <Button
                className="mt-4 text-sm"
                disabled={nextMeeting.isConfirmedByMe}
                onClick={() => setShowConfirmModal(true)}
              >
                {nextMeeting.isConfirmedByMe
                  ? "Presença confirmada"
                  : "Confirmar presença"}
              </Button>
            )}
          </>
        ) : (
          <p className="text-gray-500">Nenhum encontro agendado</p>
        )}

        {club.isAdmin && club.currentReading && (
          <Button
            variant="outline"
            className="mt-2 text-sm"
            onClick={() => setShowCompleteReadingModal(true)}
          >
            Marcar encontro como concluído
          </Button>
        )}
      </ContainerBorder>

      {club.readingHistory.length > 0 && (
        <ContainerBorder className="text-xs gap-1">
          <p className="font-medium mb-1">Histórico de leitura</p>
          <div className="flex gap-2">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2">
                {club.readingHistory.map((book) => (
                  <CarouselItem
                    key={book.id}
                    className="pl-2 basis-23"
                    onClick={() => navigate(`/livros/${book.id}`)}
                  >
                    <BookImage
                      book={{
                        title_original: book.title,
                        image_thumbnail: book.imageThumbnail,
                        image_medium: book.imageMedium,
                        image_large: book.imageLarge,
                      }}
                      height="h-28"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </ContainerBorder>
      )}

      {editingField === "meetings" && (
        <EditMeetingsModal club={club} onClose={() => setEditingField(null)} />
      )}

      {showAttendanceModal && nextMeeting && (
        <MeetingAttendanceModal
          meetingId={nextMeeting.id}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}

      {showConfirmModal && nextMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-medium">Confirme sua presença</h2>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <p className="font-medium">Próximo encontro</p>
                <p className="flex gap-2">
                  {nextMeeting.confirmedMembers}/{club.totalParticipants}{" "}
                  <UsersRound size={14} />
                </p>
              </div>

              <div className="text-xs flex flex-col gap-1">
                {club.currentReading && (
                  <p>Leitura: {club.currentReading.title}</p>
                )}
                <p>{toBrazilianDate(nextMeeting.date)}</p>
                <p>
                  {nextMeeting.location} ás {nextMeeting.time}
                </p>
              </div>

              <LocalizationPin
                state={club.stateAbbreviation}
                city={club.cityName}
                size="text-xs"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="link"
                onClick={() => setShowConfirmModal(false)}
                disabled={confirmAttendance.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmAttendance}
                disabled={confirmAttendance.isPending}
              >
                {confirmAttendance.isPending ? "Confirmando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCompleteReadingModal && club.currentReading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-medium">Concluir leitura atual</h2>

            <p className="text-sm text-muted-foreground">
              "{club.currentReading.title}" vai pro histórico de leituras do
              clube e o encontro marcado pra ela será fechado. Você poderá
              escolher a próxima leitura depois.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="link"
                onClick={() => setShowCompleteReadingModal(false)}
                disabled={completeReading.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCompleteReading}
                disabled={completeReading.isPending}
              >
                {completeReading.isPending ? "Concluindo..." : "Concluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
