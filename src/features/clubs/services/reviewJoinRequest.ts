import { supabase } from "@/lib/supabase";

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
