import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeClubReading } from "../services/clubReadings";

export function useCompleteClubReading(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeClubReading(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
