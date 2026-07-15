import { supabase } from "@/lib/supabase";

// Campos ausentes (undefined) não são alterados no banco; string vazia limpa.
export interface UpdateClubInput {
  clubId: string;
  description?: string;
  rules?: string;
  meetingDescription?: string;
}

export async function updateClub(input: UpdateClubInput): Promise<void> {
  const { error } = await supabase.rpc("update_club", {
    p_club_id: input.clubId,
    p_description: input.description ?? null,
    p_rules: input.rules ?? null,
    p_meeting_description: input.meetingDescription ?? null,
  });

  if (error) throw error;
}
