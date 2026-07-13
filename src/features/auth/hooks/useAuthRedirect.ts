import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GOOGLE_SIGNUP_PENDING_KEY } from "../services/signInWithGoogle";

export function useAuthRedirect(redirectIfLogged = "/home") {
  const navigate = useNavigate();

  useEffect(() => {
    let handled = false;

    async function redirectBySession(userId: string, provider?: string) {
      if (handled) return;
      handled = true;

      const pendingGoogleSignUp = localStorage.getItem(
        GOOGLE_SIGNUP_PENDING_KEY,
      );

      if (provider === "google") {
        // cadastro via Google iniciado e não concluído → retoma o wizard
        if (pendingGoogleSignUp) {
          navigate("/cadastrar");
          return;
        }

        // conta Google que nunca completou o onboarding (state_id só é
        // preenchido no passo "complete seu perfil") → vai para o cadastro
        const { data: profile } = await supabase
          .from("profiles")
          .select("state_id")
          .eq("id", userId)
          .maybeSingle();

        if (profile && profile.state_id == null) {
          localStorage.setItem(GOOGLE_SIGNUP_PENDING_KEY, "1");
          navigate("/cadastrar");
          return;
        }
      } else if (pendingGoogleSignUp) {
        // flag órfã de um fluxo Google abandonado não deve sequestrar
        // um login por email
        localStorage.removeItem(GOOGLE_SIGNUP_PENDING_KEY);
      }

      navigate(redirectIfLogged);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        redirectBySession(data.user.id, data.user.app_metadata.provider);
      }
    });

    // no retorno do OAuth a sessão só existe depois que o cliente troca
    // o código da URL — o getUser acima roda cedo demais nesse caso
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // setTimeout evita deadlock: o supabase-js segura um lock enquanto
        // notifica os listeners, e redirectBySession chama o client
        setTimeout(
          () =>
            redirectBySession(
              session.user.id,
              session.user.app_metadata.provider,
            ),
          0,
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectIfLogged]);
}
