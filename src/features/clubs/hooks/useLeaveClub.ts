import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveClub } from "../services/clubs";

export function useLeaveClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["club-book-rating", clubId] });
      queryClient.invalidateQueries({
        queryKey: ["club-reading-readers", clubId],
      });
    },
  });
}
