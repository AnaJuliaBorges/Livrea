import { useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email?: string;
  name: string;
  bio: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function getUser(data: { user: User; session: Session }) {
    setSession(data.session);

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id,name,bio")
      .eq("id", data.user.id)
      .limit(1);

    if (profileError || !profiles?.[0]) {
      setError(profileError?.message ?? "Perfil não encontrado");
    } else {
      setUser({ ...profiles[0], email: data.user.email });
    }

    setLoading(false);
  }

  return { user, session, loading, error, getUser };
}
