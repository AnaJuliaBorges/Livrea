import { useQuery } from "@tanstack/react-query";
import { getClub } from "../services/getClub";

export function useClub(clubId: string | undefined) {
  return useQuery({
    queryKey: ["club", clubId],
    queryFn: () => getClub(clubId!),
    enabled: Boolean(clubId),
  });
}
