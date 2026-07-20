import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { ContainerBorder } from "@/components/ContainerBorder";
import { UserAvatar } from "@/components/UserAvatar";
import { supabase } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/utils";
import { useMeetingAttendance } from "../hooks/useMeetingAttendance";
import { useCancelMeetingAttendance } from "../hooks/useCancelMeetingAttendance";
import type { MeetingAttendanceMember } from "../dtos";

interface Props {
  clubId: string;
  meetingId: string;
  onClose: () => void;
}

function MemberRow({
  member,
  isOwn,
  onCancel,
  isCancelling,
}: {
  member: MeetingAttendanceMember;
  isOwn: boolean;
  onCancel?: () => void;
  isCancelling?: boolean;
}) {
  return (
    <ContainerBorder
      key={member.id}
      className="flex-row justify-between items-center"
    >
      <div className="flex gap-2 items-center">
        <UserAvatar
          name={member.name}
          src={member.avatarUrl}
          className="h-10 w-10"
          fallbackClassName="text-xs"
        />
        <div>
          <p className="text-sm font-medium">{member.name}</p>
          {member.isAdmin && (
            <p className="text-[10px] text-primary">Administrador</p>
          )}
        </div>
      </div>
      {isOwn && onCancel && (
        <Button
          variant="link"
          className="text-xs h-auto p-0 text-destructive"
          disabled={isCancelling}
          onClick={onCancel}
        >
          {isCancelling ? "Cancelando..." : "Cancelar"}
        </Button>
      )}
    </ContainerBorder>
  );
}

export function MeetingAttendanceModal({ clubId, meetingId, onClose }: Props) {
  const { data: members, isLoading, isError } = useMeetingAttendance(meetingId);
  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
  const cancelAttendance = useCancelMeetingAttendance(clubId);

  const confirmed = members?.filter((member) => member.confirmed) ?? [];
  const notConfirmed = members?.filter((member) => !member.confirmed) ?? [];

  const handleCancel = () => {
    cancelAttendance.mutate(meetingId, {
      onSuccess: () => toast.success("Presença cancelada."),
      onError: (error) => {
        console.error("Error cancelling meeting attendance:", error);
        toast.error(
          getErrorMessage(error) ??
            "Não foi possível cancelar a presença. Tente novamente.",
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-medium">Presença no encontro</h2>

        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">
            Carregando participantes...
          </p>
        )}

        {isError && (
          <p className="text-center text-sm text-red-600">
            Não foi possível carregar os participantes.
          </p>
        )}

        {!isLoading && !isError && (
          <>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-sm">
                Confirmados ({confirmed.length})
              </p>
              {confirmed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ninguém confirmou presença ainda.
                </p>
              ) : (
                confirmed.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isOwn={member.id === authUser?.id}
                    onCancel={handleCancel}
                    isCancelling={cancelAttendance.isPending}
                  />
                ))
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-medium text-sm">
                Não confirmados ({notConfirmed.length})
              </p>
              {notConfirmed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todo mundo confirmou presença!
                </p>
              ) : (
                notConfirmed.map((member) => (
                  <MemberRow key={member.id} member={member} isOwn={false} />
                ))
              )}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button variant="link" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
