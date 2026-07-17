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

// Espelho do protectedLoader pras telas de visitante (home, login): quem já
// tem sessão vai direto pra lista de clubes — é o que faz o PWA instalado
// abrir logado em vez de mostrar o login de novo.
export async function publicOnlyLoader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect("/clubes");
  }

  return null;
}
