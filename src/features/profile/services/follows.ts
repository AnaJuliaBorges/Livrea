import { supabase } from "@/lib/supabase";

export interface FollowInfo {
  followersCount: number;
  isFollowing: boolean;
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  return user.id;
}

// Contagem de seguidores do perfil + se o usuário logado já segue.
// RLS permite SELECT em follows para qualquer autenticado.
export async function getFollowInfo(userId: string): Promise<FollowInfo> {
  const currentUserId = await getCurrentUserId();

  const [countResult, followingResult] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followed_id", userId),
    supabase
      .from("follows")
      .select("follower_id")
      .eq("followed_id", userId)
      .eq("follower_id", currentUserId)
      .maybeSingle(),
  ]);

  if (countResult.error) throw countResult.error;
  if (followingResult.error) throw followingResult.error;

  return {
    followersCount: countResult.count ?? 0,
    isFollowing: Boolean(followingResult.data),
  };
}

// Idempotente: seguir quem já se segue não é erro (ON CONFLICT DO NOTHING).
export async function followUser(userId: string): Promise<void> {
  const currentUserId = await getCurrentUserId();

  const { error } = await supabase.from("follows").upsert(
    { follower_id: currentUserId, followed_id: userId },
    { onConflict: "follower_id,followed_id", ignoreDuplicates: true },
  );

  if (error) throw error;
}

export async function unfollowUser(userId: string): Promise<void> {
  const currentUserId = await getCurrentUserId();

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", currentUserId)
    .eq("followed_id", userId);

  if (error) throw error;
}
