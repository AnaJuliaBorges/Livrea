import { supabase } from "@/lib/supabase";

export type Genre = {
  id: number;
  name: string;
  google_category: string | null;
};

export async function getGenres(): Promise<Genre[]> {
  const { data, error } = await supabase
    .from("genres")
    .select("id, name, google_category")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
