import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getProfileGenreIds } from "../services/getProfileGenreIds";

export function useProfileGenreIds() {
  const authQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
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

  return {
    ...query,
    isLoading: authQuery.isLoading || query.isLoading,
    isError: authQuery.isError || query.isError,
    error: authQuery.error ?? query.error,
  };
}
