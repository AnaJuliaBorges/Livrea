import { supabase } from "@/lib/supabase";
import type { MeetingAttendanceMember } from "../dtos";

export interface UpsertNextMeetingInput {
  clubId: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export async function upsertNextMeeting(
  input: UpsertNextMeetingInput,
): Promise<void> {
  const { error } = await supabase.rpc("upsert_next_meeting", {
    p_club_id: input.clubId,
    p_location: input.location.trim(),
    p_meeting_date: `${input.date} ${input.time}`,
  });

  if (error) throw error;
}

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

export async function confirmMeetingAttendance(
  meetingId: string,
): Promise<void> {
  const { error } = await supabase.rpc("confirm_meeting_attendance", {
    p_meeting_id: meetingId,
  });

  if (error) throw error;
}

export async function cancelMeetingAttendance(
  meetingId: string,
): Promise<void> {
  const { error } = await supabase.rpc("cancel_meeting_attendance", {
    p_meeting_id: meetingId,
  });

  if (error) throw error;
}
