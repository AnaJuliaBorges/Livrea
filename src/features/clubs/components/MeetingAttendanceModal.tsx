import { Button } from "@/components/ui";
import { ContainerBorder } from "@/components/ContainerBorder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMeetingAttendance } from "../hooks/useMeetingAttendance";
import type { MeetingAttendanceMember } from "../dtos";

interface Props {
  meetingId: string;
  onClose: () => void;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberRow({ member }: { member: MeetingAttendanceMember }) {
  return (
    <ContainerBorder
      key={member.id}
      className="flex-row justify-between items-center"
    >
      <div className="flex gap-2 items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={member.avatarUrl ?? undefined}
            alt={member.name}
            className="object-cover"
          />
          <AvatarFallback className="text-xs">
            {initialsOf(member.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{member.name}</p>
          {member.isAdmin && (
            <p className="text-[10px] text-primary">Administrador</p>
          )}
        </div>
      </div>
    </ContainerBorder>
  );
}

export function MeetingAttendanceModal({ meetingId, onClose }: Props) {
  const { data: members, isLoading, isError } = useMeetingAttendance(meetingId);

  const confirmed = members?.filter((member) => member.confirmed) ?? [];
  const notConfirmed = members?.filter((member) => !member.confirmed) ?? [];

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
                  <MemberRow key={member.id} member={member} />
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
                  <MemberRow key={member.id} member={member} />
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
