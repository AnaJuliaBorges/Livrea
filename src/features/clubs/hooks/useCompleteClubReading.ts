import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeClubReading } from "../services/clubReadings";

export function useCompleteClubReading(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note?: string) => completeClubReading(clubId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
