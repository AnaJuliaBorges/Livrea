import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getProfileGenreIds } from "../services/getProfileGenreIds";

export function useProfileGenreIds() {
  const authQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      // getUser() NÃO lança quando falha: devolve { user: null, error }.
      // Sem checar o error, a falha virava uma query bem-sucedida com null —
      // sem retry, sem chegar no reportError, e a query de gêneros abaixo
      // ficava presa em `enabled: false`. A tela então anunciava "você ainda
      // não tem gêneros favoritos" para quem tem gêneros salvos.
      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

      return data.user;
    },
  });

  const userId = authQuery.data?.id;

  const query = useQuery({
    queryKey: ["profile-genre-ids", userId],
    queryFn: () => getProfileGenreIds(userId as string),
    enabled: !!userId,
  });

  // as duas queries são um passo só para quem consome: falhar em qualquer
  // uma delas significa "não sei os gêneros", nunca "não tem gêneros"
  return {
    ...query,
    isLoading: authQuery.isLoading || query.isLoading,
    isError: authQuery.isError || query.isError,
    error: authQuery.error ?? query.error,
  };
}
