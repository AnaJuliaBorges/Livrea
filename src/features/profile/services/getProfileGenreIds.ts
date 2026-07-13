import { supabase } from "@/lib/supabase";

export async function getProfileGenreIds(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("profile_genres")
    .select("genre_id")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return ((data ?? []) as { genre_id: number }[]).map((row) => row.genre_id);
}
