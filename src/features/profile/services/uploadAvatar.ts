import { supabase } from "@/lib/supabase";
import { imageExtension } from "@/lib/imageUpload";

export async function uploadAvatar(userId: string, file: File) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.id !== userId) {
    throw new Error(
      "Sessão não encontrada — upload do avatar exige usuário autenticado",
    );
  }

  const path = `${userId}/avatar.${imageExtension(file)}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);

  if (updateError) throw updateError;

  return publicUrl;
}
