import { supabase } from "@/lib/supabase";

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
