// CRUD e listagem do clube em si (create/update/delete/get/list, sair do
// clube e cor do header). Antes um arquivo por RPC; agrupado por agregado.
import { supabase } from "@/lib/supabase";
import { uploadClubCover } from "./uploadClubCover";
import { DEFAULT_HEADER_COLOR } from "@/lib/headerColors";
import type { Club, ClubListItem, ClubMatchGroup } from "../dtos";

// ---------------------------------------------------------------- createClub

// Valores do wizard (pt) → enums do banco (club_frequency / club_meeting_type)
const frequencyMap: Record<string, string> = {
  semanal: "weekly",
  quinzenal: "biweekly",
  mensal: "monthly",
  bimestral: "bimonthly",
  outro: "custom",
};

const meetingTypeMap: Record<string, string> = {
  presencial: "in_person",
  hibrido: "hybrid",
  online: "online",
};

export interface CreateClubInput {
  clubName: string;
  description: string;
  rules: string;
  frequency: string;
  customFrequency: string;
  meetingType: string;
  cityId: string;
  privacy: string;
  hasLimit: string;
  maxParticipants: string;
  meetingDescription: string;
  selectedGenres: number[];
  coverFile: File | null;
}

export interface CreatedClub {
  id: string;
  name: string;
}

export async function createClub(input: CreateClubInput): Promise<CreatedClub> {
  const coverUrl = input.coverFile
    ? await uploadClubCover(input.coverFile)
    : null;

  const { data, error } = await supabase.rpc("create_club", {
    p_name: input.clubName.trim(),
    p_description: input.description.trim(),
    p_rules: input.rules.trim(),
    p_visibility: input.privacy === "publico",
    p_city_id: Number(input.cityId),
    p_frequency: frequencyMap[input.frequency] ?? "custom",
    p_custom_frequency:
      input.frequency === "outro" ? input.customFrequency.trim() : null,
    p_type: meetingTypeMap[input.meetingType] ?? "in_person",
    p_participant_limit:
      input.hasLimit === "sim" ? Number(input.maxParticipants) : null,
    p_meeting_description: input.meetingDescription.trim() || null,
    p_genre_ids: input.selectedGenres,
    p_cover_url: coverUrl,
  });

  if (error) throw error;
  if (!data) throw new Error("Clube não retornado pelo servidor");

  return data as CreatedClub;
}

// ---------------------------------------------------------------- updateClub

// Campos ausentes (undefined) não são alterados no banco; string vazia limpa
// (exceto name/genreIds, que não têm estado "vazio" válido).
export interface UpdateClubInput {
  clubId: string;
  name?: string;
  description?: string;
  rules?: string;
  meetingDescription?: string;
  genreIds?: number[];
  cityId?: number;
  // enum club_meeting_type do banco: in_person/hybrid/online
  meetingType?: string;
}

export async function updateClub(input: UpdateClubInput): Promise<void> {
  const { error } = await supabase.rpc("update_club", {
    p_club_id: input.clubId,
    p_name: input.name ?? null,
    p_description: input.description ?? null,
    p_rules: input.rules ?? null,
    p_meeting_description: input.meetingDescription ?? null,
    p_genre_ids: input.genreIds ?? null,
    p_city_id: input.cityId ?? null,
    p_type: input.meetingType ?? null,
  });

  if (error) throw error;
}

// ---------------------------------------------------------------- deleteClub

export async function deleteClub(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("delete_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
}

// ------------------------------------------------------------------- getClub

type RawClub = {
  id: string;
  name: string;
  description: string | null;
  rules: string | null;
  cover_url: string | null;
  header_color: string | null;
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
    reading_id?: string;
    id: string;
    title: string;
    image_thumbnail: string | null;
    image_medium: string | null;
    image_large: string | null;
    note?: string | null;
  }[];
};

function mapClubDetail(raw: RawClub): Club {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    coverUrl: raw.cover_url,
    headerColor: raw.header_color ?? DEFAULT_HEADER_COLOR,
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
      // RPC antiga não manda reading_id — cai no id do livro só como key
      readingId: book.reading_id ?? book.id,
      id: book.id,
      title: book.title,
      imageThumbnail: book.image_thumbnail,
      imageMedium: book.image_medium,
      imageLarge: book.image_large,
      note: book.note ?? null,
    })),
  };
}

export async function getClub(clubId: string): Promise<Club | null> {
  const { data, error } = await supabase.rpc("get_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
  if (!data) return null;

  return mapClubDetail(data as RawClub);
}

// ----------------------------------------------------------------- listClubs

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

function mapClubListItem(raw: RawClubListItem): ClubListItem {
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

  return ((data ?? []) as RawClubListItem[]).map(mapClubListItem);
}

// ----------------------------------------------------------------- leaveClub

// O chamador se remove do clube. O backend valida: dono não pode sair
// (precisa excluir o clube); quem não é membro recebe erro.
export async function leaveClub(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
}

// -------------------------------------------------------- setClubHeaderColor

// admin-only (a RPC valida); a cor é uma chave da paleta HEADER_COLORS
export async function setClubHeaderColor(
  clubId: string,
  color: string,
): Promise<void> {
  const { error } = await supabase.rpc("set_club_header_color", {
    p_club_id: clubId,
    p_color: color,
  });

  if (error) throw error;
}
