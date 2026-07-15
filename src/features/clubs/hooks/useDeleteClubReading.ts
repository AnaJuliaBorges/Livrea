import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClubReading } from "../services/deleteClubReading";

export function useDeleteClubReading(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteClubReading(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
