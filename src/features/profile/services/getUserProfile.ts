import { supabase } from "@/lib/supabase";
import type { UserProfile } from "../dtos";
import { mapProfile, type RawProfile } from "./mapProfile";

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase.rpc("get_user_profile", {
    p_user_id: userId,
  });

  if (error) throw error;
  if (!data) throw new Error("Perfil não encontrado");

  return mapProfile(data as RawProfile);
}
