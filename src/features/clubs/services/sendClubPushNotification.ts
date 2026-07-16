import { supabase } from "@/lib/supabase";

// Dispara a Edge Function send-push. Ela valida tudo no banco (quem pediu,
// quem é admin, quem é membro) — o payload só diz o evento e o clube.
// Chamadas são fire-and-forget nos hooks: falha de notificação nunca pode
// quebrar o fluxo principal (pedido/aprovação já aconteceram).

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
