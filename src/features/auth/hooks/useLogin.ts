import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getUser } = useAuth();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await getUser(data);
      }
    } catch (err: any) {
      if (err.code === "invalid_credentials")
        setError("Email ou senha inválidos");
      else setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
