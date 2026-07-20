import { useQuery } from "@tanstack/react-query";
import { getJoinRequests } from "../services/joinRequests";

export function useJoinRequests(clubId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["club-join-requests", clubId],
    queryFn: () => getJoinRequests(clubId),
    enabled,
  });
}
