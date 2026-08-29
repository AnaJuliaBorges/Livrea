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
