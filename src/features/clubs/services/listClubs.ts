import { supabase } from "@/lib/supabase";
import type { ClubListItem, ClubMatchGroup } from "../dtos";

type RawClubListItem = {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  visibility: boolean;
  participant_limit: number | null;
  frequency: string | null;
  custom_frequency: string | null;
  type: string;
  city_name: string | null;
  state_sigla: string | null;
  member_count: number;
  genres: { id: number; name: string }[];
  is_member: boolean;
  is_admin: boolean;
  match_group: ClubMatchGroup;
};

export interface ListClubsOptions {
  onlyMine?: boolean;
  cityId?: number | null;
  stateId?: number | null;
}

function mapClub(raw: RawClubListItem): ClubListItem {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    coverUrl: raw.cover_url,
    isPrivate: !raw.visibility,
    city: raw.city_name ?? "",
    state: raw.state_sigla ?? "",
    genres: raw.genres.map((genre) => genre.name),
    genreIds: raw.genres.map((genre) => genre.id),
    isAdmin: raw.is_admin,
    isMember: raw.is_member,
    participants: raw.member_count,
    participantLimit: raw.participant_limit,
    matchGroup: raw.match_group,
    meetingType: raw.type,
  };
}

export async function listClubs(
  options: ListClubsOptions = {},
): Promise<ClubListItem[]> {
  const { data, error } = await supabase.rpc("list_clubs", {
    p_only_mine: options.onlyMine ?? false,
    p_city_id: options.cityId ?? null,
    p_state_id: options.stateId ?? null,
    p_search: null,
    p_limit: 50,
    p_offset: 0,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubListItem[]).map(mapClub);
}
