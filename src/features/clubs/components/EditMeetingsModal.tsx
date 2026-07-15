import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, FieldLabel, Input, Textarea } from "@/components/ui";
import type { Club } from "../dtos";
import { useUpdateClub } from "../hooks/useUpdateClub";
import { useUpsertNextMeeting } from "../hooks/useUpsertNextMeeting";

interface Props {
  club: Club;
  onClose: () => void;
}

// Edição da box Encontros: descrição geral (clubs.meeting_description) e
// dados do próximo encontro (club_meetings: local + data + hora).
export function EditMeetingsModal({ club, onClose }: Props) {
  const [description, setDescription] = useState(club.meetingDescription);
  const [location, setLocation] = useState(club.nextMeeting?.location ?? "");
  const [date, setDate] = useState(club.nextMeeting?.date ?? "");
  const [time, setTime] = useState(club.nextMeeting?.time ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateClub = useUpdateClub(club.id);
  const upsertMeeting = useUpsertNextMeeting(club.id);

  const isSaving = updateClub.isPending || upsertMeeting.isPending;

  const handleSave = async () => {
    const hasMeetingFields = Boolean(location.trim() || date || time);
    const hasAllMeetingFields = Boolean(location.trim() && date && time);

    if (hasMeetingFields && !hasAllMeetingFields) {
      setValidationError(
        "Para agendar o próximo encontro, preencha local, data e hora.",
      );
      return;
    }

    setValidationError(null);

    try {
      await updateClub.mutateAsync({
        clubId: club.id,
        meetingDescription: description.trim(),
      });

      if (hasAllMeetingFields) {
        await upsertMeeting.mutateAsync({
          clubId: club.id,
          location,
          date,
          time,
        });
      }

      toast.success("Encontros atualizados!");
      onClose();
    } catch (error) {
      console.error("Error updating meetings:", error);
      // exceções das RPCs (ex.: "Defina a leitura atual do clube antes de
      // agendar um encontro") já vêm como mensagem amigável em português
      const message =
        error instanceof Error && error.message ? error.message : null;
      toast.error(message ?? "Não foi possível salvar. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4">
        <h2 className="text-lg font-medium">Editar encontros</h2>

        <Field>
          <FieldLabel>Descrição dos encontros</FieldLabel>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Toda última quinta do mês às 17h"
            className="min-h-20"
          />
        </Field>

        <div className="flex flex-col gap-3">
          <p className="text-base font-medium">Próximo encontro</p>

          <Field>
            <FieldLabel>Local</FieldLabel>
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Ex.: Livraria da Travessa - Botafogo"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Data</FieldLabel>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Hora</FieldLabel>
              <Input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </Field>
          </div>
        </div>

        {validationError && (
          <p className="text-sm text-red-500">{validationError}</p>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="link" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
