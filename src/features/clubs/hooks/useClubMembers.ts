import { useQuery } from "@tanstack/react-query";
import { getClubMembers } from "../services/getClubMembers";

export function useClubMembers(clubId: string | undefined) {
  return useQuery({
    queryKey: ["club-members", clubId],
    queryFn: () => getClubMembers(clubId!),
    enabled: Boolean(clubId),
  });
}
