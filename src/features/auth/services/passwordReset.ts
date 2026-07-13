import { supabase } from "@/lib/supabase";

// Envia o email com o link de recuperação; o link abre /redefinir-senha
// já com a sessão de recuperação criada pelo Supabase.
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  });

  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
}
