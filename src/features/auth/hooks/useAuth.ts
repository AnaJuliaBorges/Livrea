import { useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email: string;

  name: string;
  bio: string | null;

  city: {
    id: number;
    name: string;
  };

  state: {
    id: number;
    name: string;
  };
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function getUser(data: { user: User; session: Session }) {
    console.log({ data });
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id,name,bio")
      .eq("id", data.user.id)
      .limit(1);

    console.log("Profile data:", profile);
  }

  return { user, session, loading, error, getUser };
}
