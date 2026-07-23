import { supabase } from "@/lib/supabase";

// Sinaliza um retorno de OAuth do Google cujo perfil ainda não foi completado.
// Quem SETA é o publicOnlyLoader (ou o useAuthRedirect, no fallback) ao detectar
// state_id nulo no retorno do OAuth; quem CONSOME é o useGoogleSignUpReturn em
// /cadastrar, que então coloca o wizard em modo Google (passo 1 = "complete seu
// perfil", sem email/senha).
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
