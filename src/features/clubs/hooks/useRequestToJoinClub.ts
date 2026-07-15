import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestToJoinClub } from "../services/requestToJoinClub";

export function useRequestToJoinClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestToJoinClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}
