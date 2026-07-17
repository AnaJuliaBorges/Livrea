import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClubMessages, sendClubMessage } from "../services/clubChat";

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
    },
  });
}
