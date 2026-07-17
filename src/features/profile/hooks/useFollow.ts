import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followUser, getFollowInfo, unfollowUser } from "../services/follows";
import { notifyNewFollower } from "../services/sendFollowPushNotification";

export function useFollowInfo(userId: string | undefined) {
  return useQuery({
    queryKey: ["follow-info", userId],
    queryFn: () => getFollowInfo(userId!),
    enabled: Boolean(userId),
  });
}

export function useFollowUser(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => followUser(userId!),
    onSuccess: () => {
      // fire-and-forget: a Edge Function valida o follow no banco antes de
      // notificar; falha aqui não desfaz o follow
      notifyNewFollower(userId!).catch((error) =>
        console.error("Erro ao notificar novo seguidor:", error),
      );
      queryClient.invalidateQueries({ queryKey: ["follow-info", userId] });
    },
  });
}

export function useUnfollowUser(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unfollowUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-info", userId] });
    },
  });
}
