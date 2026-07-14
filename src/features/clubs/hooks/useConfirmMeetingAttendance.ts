import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmMeetingAttendance } from "../services/confirmMeetingAttendance";

export function useConfirmMeetingAttendance(clubId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmMeetingAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}
