import { ContainerBorder } from "@/components/ContainerBorder";
import type { Club } from "../dtos";
import { LocalizationPin } from "@/components/LocalizationPin";
import { UsersRound } from "lucide-react";
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
import { useConfirmMeetingAttendance } from "../hooks/useConfirmMeetingAttendance";

interface Props {
  club: Club;
}

export default function OverviewSection({ club }: Props) {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const confirmAttendance = useConfirmMeetingAttendance(club.id);

  const nextMeeting = club.nextMeeting;

  const handleConfirmAttendance = () => {
    if (!nextMeeting) return;

    confirmAttendance.mutate(nextMeeting.id, {
      onSuccess: () => {
        setShowConfirmModal(false);
        toast.success("Presença confirmada no encontro!", {
          position: "top-center",
          style: {
            background: "#ECFDF5",
            color: "var(--color-success)",
            border: "none",
            borderRadius: "8px",
          },
        });
      },
      onError: () => {
        toast.error("Não foi possível confirmar presença. Tente novamente.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <ContainerBorder className="text-xs gap-2">
        <p className="font-medium">Descrição</p>
        <p className="whitespace-pre-wrap">
          {club.description || "Este clube ainda não tem descrição."}
        </p>
      </ContainerBorder>

      <ContainerBorder className="text-xs gap-2">
        <p className="font-medium">Regras de participação</p>
        <p className="whitespace-pre-wrap">
          {club.rules || "Este clube ainda não definiu regras."}
        </p>
      </ContainerBorder>

      <ContainerBorder className="text-xs gap-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-medium">Encontros</p>
          <MeetingTypeTag type={club.type} />
        </div>
        <p className="whitespace-pre-wrap">
          {club.meetingDescription || "Sem informações sobre os encontros."}
        </p>

        {nextMeeting ? (
          <>
            <p>
              Próximo encontro: {nextMeeting.date}, {nextMeeting.location} às{" "}
              {nextMeeting.time}
            </p>
            <div className="flex justify-between mt-2">
              <LocalizationPin
                state={club.stateAbbreviation}
                city={club.cityName}
                size="text-xs"
              />
              <p className="flex gap-2">
                {nextMeeting.confirmedMembers}/{club.totalParticipants}{" "}
                <UsersRound size={14} />
              </p>
            </div>
            <Button
              className="mt-4 text-sm"
              disabled={nextMeeting.isConfirmedByMe}
              onClick={() => setShowConfirmModal(true)}
            >
              {nextMeeting.isConfirmedByMe
                ? "Presença confirmada"
                : "Confirmar presença"}
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">Nenhum encontro agendado.</p>
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
                <p>{nextMeeting.date}</p>
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
    </div>
  );
}
