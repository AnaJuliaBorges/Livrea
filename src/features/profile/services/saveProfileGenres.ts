import { supabase } from "@/lib/supabase";

export async function saveProfileGenres(userId: string, genreIds: number[]) {
  await supabase.from("profile_genres").delete().eq("user_id", userId);

  const rows = genreIds.map((genreId) => ({
    user_id: userId,
    genre_id: genreId,
  }));

  const { error } = await supabase.from("profile_genres").insert(rows);

  if (error) throw error;
}
