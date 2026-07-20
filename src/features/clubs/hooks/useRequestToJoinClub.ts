import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestToJoinClub } from "../services/joinRequests";
import { notifyClubJoinRequest } from "../services/sendClubPushNotification";

export function useRequestToJoinClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestToJoinClub(clubId),
    onSuccess: () => {
      // notifica os admins (a Edge Function só envia se ficou um pedido
      // pendente — clube público entra direto e não notifica)
      notifyClubJoinRequest(clubId).catch((error) =>
        console.error("Erro ao notificar admins do pedido:", error),
      );
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      // em clube público o usuário já entra como membro — a nota e o
      // progresso dele passam a contar
      queryClient.invalidateQueries({ queryKey: ["club-book-rating", clubId] });
      queryClient.invalidateQueries({
        queryKey: ["club-reading-readers", clubId],
      });
    },
  });
}
