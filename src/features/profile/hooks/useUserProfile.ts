import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../services/getUserProfile";

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserProfile(userId!),
    enabled: Boolean(userId),
  });
}
