import { supabase } from "@/lib/supabase";
import type { MeetingAttendanceMember } from "../dtos";

type RawAttendanceMember = {
  id: string;
  name: string;
  avatar_url: string | null;
  is_admin: boolean;
  confirmed: boolean;
};

export async function getMeetingAttendance(
  meetingId: string,
): Promise<MeetingAttendanceMember[]> {
  const { data, error } = await supabase.rpc("get_meeting_attendance", {
    p_meeting_id: meetingId,
  });

  if (error) throw error;

  return ((data ?? []) as RawAttendanceMember[]).map((member) => ({
    id: member.id,
    name: member.name,
    avatarUrl: member.avatar_url,
    isAdmin: member.is_admin,
    confirmed: member.confirmed,
  }));
}
