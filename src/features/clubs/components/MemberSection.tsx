import { ContainerBorder } from "@/components/ContainerBorder";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui";
import { useClubMembers } from "../hooks/useClubMembers";
import { useJoinRequests } from "../hooks/useJoinRequests";
import {
  useApproveJoinRequest,
  useRejectJoinRequest,
} from "../hooks/useReviewJoinRequest";
import {
  useDemoteClubMember,
  usePromoteClubMember,
  useRemoveClubMember,
} from "../hooks/useClubMemberRole";
import { RemoveMemberDialog } from "./RemoveMemberDialog";
import { SquarePlus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/utils";
import type { Club, ClubMember } from "../dtos";

interface Props {
  club: Club;
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

  const handleApprove = (requestId: string, userId: string, name: string) => {
    approve.mutate({ requestId, userId }, {
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
          (approve.isPending &&
            approve.variables?.requestId === request.requestId) ||
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
              <UserAvatar
                name={request.name}
                src={request.avatarUrl}
                className="h-10 w-10"
                fallbackClassName="text-xs"
              />
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
                onClick={() =>
                  handleApprove(request.requestId, request.userId, request.name)
                }
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
  const promote = usePromoteClubMember(club.id);
  const demote = useDemoteClubMember(club.id);
  const removeMember = useRemoveClubMember(club.id);
  const [memberToRemove, setMemberToRemove] = useState<ClubMember | null>(null);

  const handleToggleRole = (member: ClubMember) => {
    const mutation = member.isAdmin ? demote : promote;

    mutation.mutate(member.id, {
      onSuccess: () =>
        toast.success(
          member.isAdmin
            ? `${member.name} não é mais administrador.`
            : `${member.name} agora é administrador do clube!`,
        ),
      onError: (error) => {
        console.error("Error changing member role:", error);
        toast.error(
          getErrorMessage(error) ??
            "Não foi possível alterar o papel. Tente novamente.",
        );
      },
    });
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;

    removeMember.mutate(memberToRemove.id, {
      onSuccess: () => {
        toast.success(`${memberToRemove.name} foi removido do clube.`);
        setMemberToRemove(null);
      },
      onError: (error) => {
        console.error("Error removing member:", error);
        toast.error(
          getErrorMessage(error) ??
            "Não foi possível remover o participante. Tente novamente.",
        );
      },
    });
  };

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
        {members.map((member) => {
          // dono gerencia papéis de todos, menos do próprio dono
          const canManageRole = club.isOwner && !member.isOwner;
          const isProcessing =
            (promote.isPending && promote.variables === member.id) ||
            (demote.isPending && demote.variables === member.id);

          return (
            <div
              key={member.id}
              onClick={() => navigate(`/perfil/${member.id}`)}
              className="cursor-pointer"
            >
              <ContainerBorder className="flex-row justify-between items-center">
                <div className="flex gap-2 items-center">
                  <UserAvatar
                    name={member.name}
                    src={member.avatarUrl}
                    className="h-10 w-10"
                    fallbackClassName="text-xs"
                  />
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    {member.isOwner ? (
                      <p className="text-[10px] text-primary">Criador</p>
                    ) : (
                      member.isAdmin && (
                        <p className="text-[10px] text-primary">Administrador</p>
                      )
                    )}
                  </div>
                </div>
                {canManageRole && (
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="link"
                      className="text-xs h-auto p-0"
                      disabled={isProcessing}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleRole(member);
                      }}
                    >
                      {member.isAdmin ? "Remover admin" : "Tornar admin"}
                    </Button>
                    <button
                      type="button"
                      aria-label={`Remover ${member.name} do clube`}
                      className="text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMemberToRemove(member);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </ContainerBorder>
            </div>
          );
        })}
      </div>

      {memberToRemove && (
        <RemoveMemberDialog
          memberName={memberToRemove.name}
          isRemoving={removeMember.isPending}
          onConfirm={handleRemoveMember}
          onClose={() => setMemberToRemove(null)}
        />
      )}
    </div>
  );
}
