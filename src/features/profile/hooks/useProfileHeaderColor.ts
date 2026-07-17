import { useQuery } from "@tanstack/react-query";
import { getProfileHeaderColor } from "../services/getProfileHeaderColor";

export function useProfileHeaderColor(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile-header-color", userId],
    queryFn: () => getProfileHeaderColor(userId!),
    enabled: Boolean(userId),
  });
}
