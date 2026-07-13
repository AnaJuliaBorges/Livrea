import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getProfileGenreIds } from "../services/getProfileGenreIds";

export function useProfileGenreIds() {
  const { data: authUser, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const userId = authUser?.id;

  const query = useQuery({
    queryKey: ["profile-genre-ids", userId],
    queryFn: () => getProfileGenreIds(userId as string),
    enabled: !!userId,
  });

  return {
    ...query,
    isLoading: isLoadingAuth || query.isLoading,
  };
}
