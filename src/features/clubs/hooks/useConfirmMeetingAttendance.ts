import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmMeetingAttendance } from "../services/meetings";

export function useConfirmMeetingAttendance(clubId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmMeetingAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["meeting-attendance"] });
    },
  });
}
