import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { type SignupFormInput } from "../schema";

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

  const handleSignupFirstStep = async (data: SignupFormInput) => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            bio: data.bio,
            state_id: data.state_id,
            city_id: data.city_id,
          },
        },
      });

      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      return authData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSignupFirstStep,
    useStates,
    useCities,
    loading,
    error,
  };
}
