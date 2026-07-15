import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertNextMeeting } from "../services/upsertNextMeeting";

export function useUpsertNextMeeting(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertNextMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
