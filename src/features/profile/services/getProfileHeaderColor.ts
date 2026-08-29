import { supabase } from "@/lib/supabase";
import { DEFAULT_HEADER_COLOR } from "@/lib/headerColors";

export async function getProfileHeaderColor(userId: string): Promise<string> {
  const { data, error } = await supabase.rpc("get_profile_header_color", {
    p_user_id: userId,
  });

  if (error) throw error;

  return (data as string | null) ?? DEFAULT_HEADER_COLOR;
}
