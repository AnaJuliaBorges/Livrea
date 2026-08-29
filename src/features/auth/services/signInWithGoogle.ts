import { supabase } from "@/lib/supabase";

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
