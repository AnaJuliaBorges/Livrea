import { supabase } from "@/lib/supabase";

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
