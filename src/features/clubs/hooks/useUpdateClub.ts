import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClub } from "../services/clubs";

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}
