import { supabase } from "@/lib/supabase";

export interface ClubReadingReader {
  userId: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  // % lida da edição que o próprio membro está lendo (o de-para de edições
  // equivalentes é feito na RPC por título+autores, não só por ISBN)
  progress: number;
  // false = ainda não começou (sem registro ou só na lista de desejos)
  started: boolean;
  rating: number | null;
}

type RawClubReadingReader = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_admin: boolean;
  progress: number;
  started: boolean;
  rating: number | null;
};

export async function getClubReadingReaders(
  clubId: string,
  bookId: string,
): Promise<ClubReadingReader[]> {
  const { data, error } = await supabase.rpc("get_club_reading_readers", {
    p_club_id: clubId,
    p_book_id: bookId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubReadingReader[]).map((reader) => ({
    userId: reader.user_id,
    name: reader.name,
    avatarUrl: reader.avatar_url,
    isAdmin: reader.is_admin,
    progress: reader.progress,
    started: reader.started,
    rating: reader.rating,
  }));
}
