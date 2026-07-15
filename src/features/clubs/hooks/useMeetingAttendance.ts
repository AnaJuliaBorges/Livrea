import { useQuery } from "@tanstack/react-query";
import { getMeetingAttendance } from "../services/getMeetingAttendance";

export function useMeetingAttendance(meetingId: string | undefined) {
  return useQuery({
    queryKey: ["meeting-attendance", meetingId],
    queryFn: () => getMeetingAttendance(meetingId!),
    enabled: Boolean(meetingId),
  });
}
