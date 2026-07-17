import { supabase } from "@/lib/supabase";

// Dispara a Edge Function send-push para o evento de novo seguidor.
// Ela valida no banco que o follow existe — o payload só diz quem foi seguido.
// Chamada fire-and-forget no hook: falha de notificação nunca desfaz o follow.
export async function notifyNewFollower(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { type: "new_follower", userId },
  });

  if (error) throw error;
}
