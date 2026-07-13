import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";
import { GOOGLE_SIGNUP_PENDING_KEY } from "../../services/signInWithGoogle";

// Retorno do OAuth em /cadastrar: a conta já existe (trigger de profiles
// incluso), então o wizard entra em modo Google — o passo 1 vira
// "complete seu perfil" (foto/bio/localização), sem email e senha.
export function useGoogleSignUpReturn() {
  useEffect(() => {
    if (!localStorage.getItem(GOOGLE_SIGNUP_PENDING_KEY)) return;

    let done = false;

    async function completeFromSession(session: Session) {
      if (done) return;
      done = true;
      localStorage.removeItem(GOOGLE_SIGNUP_PENDING_KEY);

      const { user } = session;
      const metadata = user.user_metadata as {
        name?: string;
        full_name?: string;
        avatar_url?: string;
        picture?: string;
      };
      const name = metadata.name ?? metadata.full_name ?? "";
      const avatarUrl = metadata.avatar_url ?? metadata.picture ?? "";

      // garante nome e foto no perfil mesmo se o usuário abandonar o
      // wizard aqui — o trigger handle_new_user pode não copiar o metadata
      const { error } = await supabase
        .from("profiles")
        .update({
          ...(name && { name }),
          ...(avatarUrl && { avatar_url: avatarUrl }),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving Google profile data:", error);
      }

      // descarta restos de um cadastro anterior abandonado
      const { reset, update } = useSignUpWizardStore.getState();
      reset();
      update("account", {
        user_id: user.id,
        name,
        email: user.email ?? "",
        password: "",
        bio: "",
        state_id: 0,
        city_id: 0,
        avatar_url: avatarUrl,
      });
      update("googleSignUp", true);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) completeFromSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // setTimeout evita deadlock: o supabase-js segura um lock enquanto
        // notifica os listeners, e completeFromSession chama o client
        setTimeout(() => completeFromSession(session), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
