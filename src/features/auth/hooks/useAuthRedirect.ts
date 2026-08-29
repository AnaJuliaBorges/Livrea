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
        if (pendingGoogleSignUp) {
          navigate("/cadastrar");
          return;
        }

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
        localStorage.removeItem(GOOGLE_SIGNUP_PENDING_KEY);
      }

      navigate(redirectIfLogged);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        redirectBySession(data.user.id, data.user.app_metadata.provider);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
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
