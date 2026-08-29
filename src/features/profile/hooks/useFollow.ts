import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      notifyNewFollower(userId!).catch((error) =>
        console.error("Erro ao notificar novo seguidor:", error),
      );
      queryClient.invalidateQueries({ queryKey: ["follow-info", userId] });
      toast.success("Agora você está seguindo este perfil!");
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
