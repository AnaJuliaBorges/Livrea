import { supabase } from "@/lib/supabase";
import type { ClubJoinRequest } from "../dtos";

type RawJoinRequest = {
  request_id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
};

export async function getJoinRequests(
  clubId: string,
): Promise<ClubJoinRequest[]> {
  const { data, error } = await supabase.rpc("get_pending_join_requests", {
    p_club_id: clubId,
  });

  if (error) throw error;

  return ((data ?? []) as RawJoinRequest[]).map((request) => ({
    requestId: request.request_id,
    userId: request.user_id,
    name: request.name,
    avatarUrl: request.avatar_url,
  }));
}
