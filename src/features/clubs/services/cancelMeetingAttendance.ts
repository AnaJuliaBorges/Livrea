import { supabase } from "@/lib/supabase";

export async function cancelMeetingAttendance(
  meetingId: string,
): Promise<void> {
  const { error } = await supabase.rpc("cancel_meeting_attendance", {
    p_meeting_id: meetingId,
  });

  if (error) throw error;
}
