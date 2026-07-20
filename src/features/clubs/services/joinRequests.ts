// Fluxo "pedir para participar": pedido, listagem pendente (admin) e
// aprovação/recusa. Antes um arquivo por RPC; agrupado por agregado.
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

// Clube público: entra direto em club_members. Clube privado: cria um
// club_join_requests pendente (idempotente) para o admin aprovar/recusar.
export async function requestToJoinClub(clubId: string): Promise<void> {
  const { error } = await supabase.rpc("request_to_join_club", {
    p_club_id: clubId,
  });

  if (error) throw error;
}

export async function approveJoinRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc("approve_join_request", {
    p_request_id: requestId,
  });

  if (error) throw error;
}

export async function rejectJoinRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc("reject_join_request", {
    p_request_id: requestId,
  });

  if (error) throw error;
}
