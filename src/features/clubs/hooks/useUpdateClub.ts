import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClub } from "../services/updateClub";

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
