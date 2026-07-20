import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "../services/joinRequests";
import { notifyJoinRequestApproved } from "../services/sendClubPushNotification";

function useInvalidateAfterReview(clubId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["club-join-requests", clubId] });
    queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
    queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    queryClient.invalidateQueries({ queryKey: ["clubs"] });
    // membro novo entra na média do clube e na lista de leitores
    queryClient.invalidateQueries({ queryKey: ["club-book-rating", clubId] });
    queryClient.invalidateQueries({
      queryKey: ["club-reading-readers", clubId],
    });
  };
}

export function useApproveJoinRequest(clubId: string) {
  const invalidate = useInvalidateAfterReview(clubId);

  return useMutation({
    // userId é do dono do pedido — usado só pra notificar o aprovado
    mutationFn: ({ requestId }: { requestId: string; userId: string }) =>
      approveJoinRequest(requestId),
    onSuccess: (_data, { userId }) => {
      invalidate();
      notifyJoinRequestApproved(clubId, userId).catch((error) =>
        console.error("Erro ao notificar membro aprovado:", error),
      );
    },
  });
}

export function useRejectJoinRequest(clubId: string) {
  const invalidate = useInvalidateAfterReview(clubId);

  return useMutation({
    mutationFn: rejectJoinRequest,
    onSuccess: invalidate,
  });
}
