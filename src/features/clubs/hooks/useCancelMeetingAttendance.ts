import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelMeetingAttendance } from "../services/meetings";

export function useCancelMeetingAttendance(clubId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMeetingAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      queryClient.invalidateQueries({ queryKey: ["meeting-attendance"] });
    },
  });
}
