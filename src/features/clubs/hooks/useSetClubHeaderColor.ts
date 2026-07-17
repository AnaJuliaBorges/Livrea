import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setClubHeaderColor } from "../services/setClubHeaderColor";

export function useSetClubHeaderColor(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (color: string) => setClubHeaderColor(clubId, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
