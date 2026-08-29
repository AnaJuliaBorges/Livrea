import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";
import { GOOGLE_SIGNUP_PENDING_KEY } from "../../services/signInWithGoogle";

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
        setTimeout(() => completeFromSession(session), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
