import { supabase } from "@/lib/supabase";

export interface FollowInfo {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface FollowUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

type RawFollowUser = {
  id: string;
  name: string;
  avatar_url: string | null;
};

function mapFollowUsers(data: unknown): FollowUser[] {
  return ((data ?? []) as RawFollowUser[]).map((user) => ({
    id: user.id,
    name: user.name,
    avatarUrl: user.avatar_url,
  }));
}

export async function getFollowers(userId: string): Promise<FollowUser[]> {
  const { data, error } = await supabase.rpc("get_followers", {
    p_user_id: userId,
  });

  if (error) throw error;

  return mapFollowUsers(data);
}

export async function getFollowing(userId: string): Promise<FollowUser[]> {
  const { data, error } = await supabase.rpc("get_following", {
    p_user_id: userId,
  });

  if (error) throw error;

  return mapFollowUsers(data);
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  return user.id;
}

export async function getFollowInfo(userId: string): Promise<FollowInfo> {
  const currentUserId = await getCurrentUserId();

  const [followersResult, followingCountResult, isFollowingResult] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followed_id", userId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
      supabase
        .from("follows")
        .select("follower_id")
        .eq("followed_id", userId)
        .eq("follower_id", currentUserId)
        .maybeSingle(),
    ]);

  if (followersResult.error) throw followersResult.error;
  if (followingCountResult.error) throw followingCountResult.error;
  if (isFollowingResult.error) throw isFollowingResult.error;

  return {
    followersCount: followersResult.count ?? 0,
    followingCount: followingCountResult.count ?? 0,
    isFollowing: Boolean(isFollowingResult.data),
  };
}

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
