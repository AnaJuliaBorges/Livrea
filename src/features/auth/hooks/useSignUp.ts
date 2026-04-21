import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

interface State {
  id: number;
  name: string;
  sigla: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getStates(): Promise<State[]> {
    const { data, error } = await supabase
      .from("states")
      .select("id, name, sigla")
      .order("name");

    if (error) throw error;
    return data ?? [];
  }

  function useStates() {
    return useQuery({
      queryKey: ["states"],
      queryFn: getStates,
    });
  }

  async function getCities(stateId: number): Promise<City[]> {
    const { data, error } = await supabase
      .from("cities")
      .select("id, name, state_id")
      .eq("state_id", stateId)
      .order("name");

    if (error) throw error;
    return data ?? [];
  }

  function useCities(stateId?: number) {
    return useQuery({
      queryKey: ["cities", stateId],
      enabled: !!stateId,
      queryFn: () => getCities(stateId!),
    });
  }
  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signup,
    useStates,
    useCities,
    loading,
    error,
  };
}
