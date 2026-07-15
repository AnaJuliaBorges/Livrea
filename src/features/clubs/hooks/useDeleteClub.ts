import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClub } from "../services/deleteClub";

export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}
