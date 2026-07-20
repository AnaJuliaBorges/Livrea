import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  followUser,
  getFollowers,
  getFollowing,
  getFollowInfo,
  unfollowUser,
} from "../services/follows";
import { notifyNewFollower } from "../services/sendFollowPushNotification";

export function useFollowInfo(userId: string | undefined) {
  return useQuery({
    queryKey: ["follow-info", userId],
    queryFn: () => getFollowInfo(userId!),
    enabled: Boolean(userId),
  });
}

// só busca quando `enabled` (ex.: modal de seguidores aberto)
export function useFollowers(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(userId!),
    enabled: Boolean(userId) && enabled,
  });
}

export function useFollowing(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(userId!),
    enabled: Boolean(userId) && enabled,
  });
}

// Deixa de seguir alguém a partir da lista "Seguindo" do próprio perfil
// (`profileUserId`): atualiza a lista, as contagens do dono e o follow-info
// do alvo. Diferente de useUnfollowUser (botão de um perfil específico).
export function useUnfollow(profileUserId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => unfollowUser(targetId),
    onSuccess: (_result, targetId) => {
      queryClient.invalidateQueries({ queryKey: ["following", profileUserId] });
      queryClient.invalidateQueries({
        queryKey: ["follow-info", profileUserId],
      });
      queryClient.invalidateQueries({ queryKey: ["follow-info", targetId] });
    },
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
