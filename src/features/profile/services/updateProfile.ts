import { supabase } from "@/lib/supabase";

export type UpdateProfileParams = {
  userId: string;
  name: string;
  bio: string | null;
  stateId: number;
  cityId: number;
  headerColor: string;
};

export async function updateProfile({
  userId,
  name,
  bio,
  stateId,
  cityId,
  headerColor,
}: UpdateProfileParams) {
  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      bio,
      state_id: stateId,
      city_id: cityId,
      header_color: headerColor,
    })
    .eq("id", userId);

  if (error) throw error;
}
