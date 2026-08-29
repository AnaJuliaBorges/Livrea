import { supabase } from "@/lib/supabase";

export async function notifyClubJoinRequest(clubId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { type: "join_request", clubId },
  });

  if (error) throw error;
}

export async function notifyJoinRequestApproved(
  clubId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { type: "request_approved", clubId, userId },
  });

  if (error) throw error;
}

async function notifyMemberEvent(
  type: "member_promoted" | "member_demoted" | "member_removed",
  clubId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { type, clubId, userId },
  });

  if (error) throw error;
}

export function notifyMemberPromoted(clubId: string, userId: string) {
  return notifyMemberEvent("member_promoted", clubId, userId);
}

export function notifyMemberDemoted(clubId: string, userId: string) {
  return notifyMemberEvent("member_demoted", clubId, userId);
}

export function notifyMemberRemoved(clubId: string, userId: string) {
  return notifyMemberEvent("member_removed", clubId, userId);
}
