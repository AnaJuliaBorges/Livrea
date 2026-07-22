import { supabase } from "@/lib/supabase";

// A marca de "já viu o tour" mora em profiles.welcome_tour_seen (não no
// localStorage): segue o usuário em qualquer aparelho e cada conta nova vê
// uma vez, mesmo compartilhando o navegador. Coluna adicionada por
// supabase/sql/profile_welcome_tour_seen.sql.
//
// Lê e escreve a própria linha direto (mesma RLS de self-select/self-update
// que useAuth e updateProfile já usam), sem RPC.

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

// Sem sessão (não deveria ocorrer dentro do shell logado) tratamos como "já
// viu": não mostra o tour para não-usuário.
export async function getWelcomeTourSeen(): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) return true;

  const { data, error } = await supabase
    .from("profiles")
    .select("welcome_tour_seen")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return data?.welcome_tour_seen === true;
}

export async function markWelcomeTourSeen(): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) return;

  const { error } = await supabase
    .from("profiles")
    .update({ welcome_tour_seen: true })
    .eq("id", userId);

  if (error) throw error;
}
