import { supabase } from "@/lib/supabase";
import { redirect } from "react-router-dom";

export async function protectedLoader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/login");
  }

  return null;
}
