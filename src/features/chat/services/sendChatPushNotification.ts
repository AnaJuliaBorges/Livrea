import { supabase } from "@/lib/supabase";

// Dispara a Edge Function send-push pro evento de mensagem no chat.
// Ela valida no banco (membro + mensagem recente) e monta o preview por lá —
// o payload só diz o clube. Fire-and-forget no hook: falha de notificação
// nunca desfaz o envio da mensagem.
export async function notifyClubMessage(clubId: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-push", {
    body: { type: "club_message", clubId },
  });

  if (error) throw error;
}
