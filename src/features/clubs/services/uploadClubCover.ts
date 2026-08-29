import { supabase } from "@/lib/supabase";
import { imageExtension } from "@/lib/imageUpload";

export async function uploadClubCover(file: File): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error(
      "Sessão não encontrada — upload da capa exige usuário autenticado",
    );
  }

  const path = `${session.user.id}/${Date.now()}.${imageExtension(file)}`;

  const { error } = await supabase.storage
    .from("club-covers")
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("club-covers").getPublicUrl(path);

  return publicUrl;
}
