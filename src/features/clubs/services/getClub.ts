import { supabase } from "@/lib/supabase";
import type { Club } from "../dtos";

type RawClub = {
  id: string;
  name: string;
  description: string | null;
  rules: string | null;
  cover_url: string | null;
  visibility: boolean;
  participant_limit: number | null;
  frequency: string | null;
  custom_frequency: string | null;
  type: string;
  meeting_description: string | null;
  city_id: number | null;
  state_id: number | null;
  city_name: string | null;
  state_sigla: string | null;
  member_count: number;
  genres: { id: number; name: string }[];
  is_member: boolean;
  is_admin: boolean;
  is_owner: boolean;
  has_pending_request: boolean;
  current_reading: { id: string; title: string } | null;
  next_meeting: {
    id: string;
    location: string;
    date: string;
    time: string;
    confirmed_members: number;
    is_confirmed_by_me: boolean;
  } | null;
  reading_history: {
    id: string;
    title: string;
    image_thumbnail: string | null;
    image_medium: string | null;
    image_large: string | null;
  }[];
};

function mapClub(raw: RawClub): Club {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    coverUrl: raw.cover_url,
    isPrivate: !raw.visibility,
    isMember: raw.is_member,
    isAdmin: raw.is_admin,
    isOwner: raw.is_owner,
    hasPendingRequest: raw.has_pending_request,
    participantLimit: raw.participant_limit,
    type: raw.type,
    frequency: raw.frequency,
    customFrequency: raw.custom_frequency,
    currentReading: raw.current_reading,
    genres: raw.genres,
    cityId: raw.city_id,
    stateId: raw.state_id,
    cityName: raw.city_name ?? "",
    stateAbbreviation: raw.state_sigla ?? "",
    totalParticipants: raw.member_count,
    meetingDescription: raw.meeting_description ?? "",
    nextMeeting: raw.next_meeting
      ? {
          id: raw.next_meeting.id,
          location: raw.next_meeting.location,
          date: raw.next_meeting.date,
          time: raw.next_meeting.time,
          confirmedMembers: raw.next_meeting.confirmed_members,
          isConfirmedByMe: raw.next_meeting.is_confirmed_by_me,
        }
      : null,
    rules: raw.rules ?? "",
    readingHistory: raw.reading_history.map((book) => ({
      id: book.id,
      title: book.title,
      imageThumbnail: book.image_thumbnail,
      imageMedium: book.image_medium,
      imageLarge: book.image_large,
    })),
  };
}

export async function getClub(clubId: string): Promise<Club | null> {
  const { data, error } = await supabase.rpc("get_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
  if (!data) return null;

  return mapClub(data as RawClub);
}
