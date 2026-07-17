import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClubMessages, sendClubMessage } from "../services/clubChat";
import { notifyClubMessage } from "../services/sendChatPushNotification";

// Polling simples no lugar de realtime: bem mais barato de manter e
// suficiente pro ritmo de um clube de leitura.
const POLL_INTERVAL_MS = 2000;

export function useClubMessages(clubId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["club-messages", clubId],
    queryFn: () => getClubMessages(clubId!),
    enabled: Boolean(clubId) && enabled,
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: 0,
  });
}

export function useSendClubMessage(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      isSpoiler,
    }: {
      content: string;
      isSpoiler: boolean;
    }) => sendClubMessage(clubId, content, isSpoiler),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-messages", clubId] });
      // fire-and-forget: a Edge Function valida tudo no banco e aplica o
      // anti-spam; falha aqui não desfaz o envio da mensagem
      notifyClubMessage(clubId).catch((error) =>
        console.error("Erro ao notificar mensagem do clube:", error),
      );
    },
  });
}
