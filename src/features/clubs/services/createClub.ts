import { supabase } from "@/lib/supabase";
import { uploadClubCover } from "./uploadClubCover";

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
