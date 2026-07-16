import { supabase } from "@/lib/supabase";
import type { ClubMember } from "../dtos";

type RawClubMember = {
  id: string;
  name: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_owner: boolean;
};

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
  const { data, error } = await supabase.rpc("get_club_members", {
    p_club_id: clubId,
  });

  if (error) throw error;

  return ((data ?? []) as RawClubMember[]).map((member) => ({
    id: member.id,
    name: member.name,
    avatarUrl: member.avatar_url,
    isAdmin: member.is_admin,
    isOwner: member.is_owner,
  }));
}
