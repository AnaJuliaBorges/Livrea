import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export interface State {
  id: number;
  name: string;
  abbreviation: string;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
}

async function getStates(): Promise<State[]> {
  const { data, error } = await supabase
    .from("states")
    .select("id, name, sigla")
    .order("name");

  if (error) throw error;
  return (data ?? []).map((state) => ({
    id: state.id,
    name: state.name,
    abbreviation: state.sigla,
  }));
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

export function useStates() {
  return useQuery({
    queryKey: ["states"],
    queryFn: getStates,
  });
}

export function useCities(stateId?: number) {
  return useQuery({
    queryKey: ["cities", stateId],
    enabled: !!stateId,
    queryFn: () => getCities(stateId!),
  });
}
