import { supabase } from "@/lib/supabase";

export async function confirmMeetingAttendance(meetingId: string): Promise<void> {
  const { error } = await supabase.rpc("confirm_meeting_attendance", {
    p_meeting_id: meetingId,
  });

  if (error) throw error;
}
