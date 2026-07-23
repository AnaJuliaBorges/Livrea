import { supabase } from "@/lib/supabase";
import { redirect } from "react-router-dom";
import { GOOGLE_SIGNUP_PENDING_KEY } from "@/features/auth/services/signInWithGoogle";

export async function protectedLoader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/login");
  }

  return null;
}

// Espelho do protectedLoader pras telas de visitante (home, login): quem já
// tem sessão vai direto pra lista de clubes — é o que faz o PWA instalado
// abrir logado em vez de mostrar o login de novo.
//
// Exceção do cadastro via Google: o OAuth volta para /login, cujo loader é
// este. O `state_id` só é preenchido no passo "complete seu perfil", então
// uma conta Google com perfil sem `state_id` é um cadastro a concluir → vai
// para /cadastrar (sinalizando o wizard pela flag pending). Sem esta checagem
// o redirect para /clubes engole o retorno do OAuth antes de o <Login/> montar
// e o useAuthRedirect rodar — foi por isso que o cadastro Google não levava
// ninguém para completar o perfil.
export async function publicOnlyLoader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  if (session.user.app_metadata.provider === "google") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("state_id")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profile && profile.state_id == null) {
      localStorage.setItem(GOOGLE_SIGNUP_PENDING_KEY, "1");
      return redirect("/cadastrar");
    }
  }

  return redirect("/clubes");
}
