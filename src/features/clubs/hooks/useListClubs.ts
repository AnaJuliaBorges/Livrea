import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { Club } from "../dtos";

export function useListClubs(privacidade?: boolean) {
  return useQuery<Club[]>({
    queryKey: ["clubes", privacidade],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_clubs", {
        p_privacidade: privacidade ?? null,
        p_limite: 20,
        p_offset: 0,
      });

      if (error) {
        console.error("Erro ao buscar clubes:", error);
        throw error;
      }

      return (data || []).map((row: any) => row.clube as Club);
    },
  });
}
