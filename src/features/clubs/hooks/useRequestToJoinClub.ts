import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestToJoinClub } from "../services/joinRequests";
import { notifyClubJoinRequest } from "../services/sendClubPushNotification";

export function useRequestToJoinClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestToJoinClub(clubId),
    onSuccess: () => {
      notifyClubJoinRequest(clubId).catch((error) =>
        console.error("Erro ao notificar admins do pedido:", error),
      );
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["club-book-rating", clubId] });
      queryClient.invalidateQueries({
        queryKey: ["club-reading-readers", clubId],
      });
    },
  });
}
