import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setClubReadingNote } from "../services/clubReadings";

export function useSetClubReadingNote(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ readingId, note }: { readingId: string; note: string }) =>
      setClubReadingNote(readingId, note),
    onSuccess: () => {
      // a nota vem dentro do get_club (reading_history)
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
