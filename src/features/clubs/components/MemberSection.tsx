import { ContainerBorder } from "@/components/ContainerBorder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClubMembers } from "../hooks/useClubMembers";
import { useJoinRequests } from "../hooks/useJoinRequests";
import {
  useApproveJoinRequest,
  useRejectJoinRequest,
} from "../hooks/useReviewJoinRequest";
import { SquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Club } from "../dtos";

interface Props {
  club: Club;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function JoinRequestsSection({ club }: { club: Club }) {
  const navigate = useNavigate();
  const { data: requests } = useJoinRequests(
    club.id,
    club.isAdmin && club.isPrivate,
  );
  const approve = useApproveJoinRequest(club.id);
  const reject = useRejectJoinRequest(club.id);

  if (!club.isAdmin || !club.isPrivate || !requests || requests.length === 0) {
    return null;
  }

  const handleApprove = (requestId: string, name: string) => {
    approve.mutate(requestId, {
      onSuccess: () => toast.success(`${name} agora participa do clube!`),
      onError: (error) => {
        console.error("Error approving join request:", error);
        toast.error("Não foi possível aprovar o pedido.");
      },
    });
  };

  const handleReject = (requestId: string) => {
    reject.mutate(requestId, {
      onError: (error) => {
        console.error("Error rejecting join request:", error);
        toast.error("Não foi possível recusar o pedido.");
      },
    });
  };

  return (
    <div>
      <p className="font-medium text-sm mb-2">Pedidos</p>
      {requests.map((request) => {
        const isProcessing =
          (approve.isPending && approve.variables === request.requestId) ||
          (reject.isPending && reject.variables === request.requestId);

        return (
          <ContainerBorder
            key={request.requestId}
            className="flex-row justify-between items-center"
          >
            <div
              className="flex gap-2 items-center cursor-pointer"
              onClick={() => navigate(`/perfil/${request.userId}`)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={request.avatarUrl ?? undefined}
                  alt={request.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-xs">
                  {initialsOf(request.name)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{request.name}</p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                type="button"
                aria-label={`Recusar pedido de ${request.name}`}
                disabled={isProcessing}
                onClick={() => handleReject(request.requestId)}
              >
                <X className="text-destructive" size={18} />
              </button>
              <button
                type="button"
                aria-label={`Aprovar pedido de ${request.name}`}
                disabled={isProcessing}
                onClick={() => handleApprove(request.requestId, request.name)}
              >
                <SquarePlus className="text-secondary" />
              </button>
            </div>
          </ContainerBorder>
        );
      })}
    </div>
  );
}

export default function MembersSection({ club }: Props) {
  const navigate = useNavigate();
  const { data: members, isLoading, isError } = useClubMembers(club.id);

  if (isLoading) {
    return (
      <p className="text-center text-sm text-muted-foreground mb-8">
        Carregando participantes...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-sm text-red-600 mb-8">
        Não foi possível carregar os participantes.
      </p>
    );
  }

  if (!members || members.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground mb-8">
        Este clube ainda não tem participantes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-8">
      <JoinRequestsSection club={club} />

      <div className="flex flex-col gap-2">
        <p className="font-medium text-sm mb-2">Participantes</p>
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => navigate(`/perfil/${member.id}`)}
            className="cursor-pointer"
          >
            <ContainerBorder className="flex-row justify-between items-center">
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
          </div>
        ))}
      </div>
    </div>
  );
}
