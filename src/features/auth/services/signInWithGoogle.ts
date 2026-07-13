import { supabase } from "@/lib/supabase";

// Marca que o usuário iniciou um cadastro via Google — ao voltar do OAuth
// em /cadastrar, o wizard pula a criação de conta e vai para o passo 2.
export const GOOGLE_SIGNUP_PENDING_KEY = "livrea_google_signup_pending";

export async function signInWithGoogle(redirectPath: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${redirectPath}`,
    },
  });

  if (error) throw error;
}
