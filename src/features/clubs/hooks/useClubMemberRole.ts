import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  demoteClubMember,
  promoteClubMember,
  removeClubMember,
} from "../services/clubMembers";
import {
  notifyMemberDemoted,
  notifyMemberPromoted,
  notifyMemberRemoved,
} from "../services/sendClubPushNotification";

function useInvalidateAfterRoleChange(clubId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
    queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    queryClient.invalidateQueries({ queryKey: ["club-book-rating", clubId] });
    queryClient.invalidateQueries({
      queryKey: ["club-reading-readers", clubId],
    });
  };
}

export function usePromoteClubMember(clubId: string) {
  const invalidate = useInvalidateAfterRoleChange(clubId);

  return useMutation({
    mutationFn: (userId: string) => promoteClubMember(clubId, userId),
    onSuccess: (_data, userId) => {
      invalidate();
      notifyMemberPromoted(clubId, userId).catch((error) =>
        console.error("Erro ao notificar promoção:", error),
      );
    },
  });
}

export function useDemoteClubMember(clubId: string) {
  const invalidate = useInvalidateAfterRoleChange(clubId);

  return useMutation({
    mutationFn: (userId: string) => demoteClubMember(clubId, userId),
    onSuccess: (_data, userId) => {
      invalidate();
      notifyMemberDemoted(clubId, userId).catch((error) =>
        console.error("Erro ao notificar rebaixamento:", error),
      );
    },
  });
}

export function useRemoveClubMember(clubId: string) {
  const invalidate = useInvalidateAfterRoleChange(clubId);

  return useMutation({
    mutationFn: (userId: string) => removeClubMember(clubId, userId),
    onSuccess: (_data, userId) => {
      invalidate();
      notifyMemberRemoved(clubId, userId).catch((error) =>
        console.error("Erro ao notificar remoção:", error),
      );
    },
  });
}
