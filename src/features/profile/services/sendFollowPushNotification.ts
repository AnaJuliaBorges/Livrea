import { supabase } from "@/lib/supabase";

export async function notifyNewFollower(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { type: "new_follower", userId },
  });

  if (error) throw error;
}
