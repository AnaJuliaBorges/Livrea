import { supabase } from "@/lib/supabase";

export async function notifyClubMessage(clubId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { type: "club_message", clubId },
  });

  if (error) throw error;
}
