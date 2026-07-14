import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClub } from "../services/createClub";

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}
