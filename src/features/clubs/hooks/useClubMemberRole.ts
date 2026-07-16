import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  demoteClubMember,
  promoteClubMember,
  removeClubMember,
} from "../services/clubMemberRole";

function useInvalidateAfterRoleChange(clubId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
    queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    // remoção de membro tira a nota/progresso dele da média do clube
    queryClient.invalidateQueries({ queryKey: ["club-book-rating", clubId] });
    queryClient.invalidateQueries({
      queryKey: ["club-reading-readers", clubId],
    });
  };
}

export function usePromoteClubMember(clubId: string) {
  const invalidate = useInvalidateAfterRoleChange(clubId);

  return useMutation({
    mutationFn: (userId: string) => promoteClubMember(clubId, userId),
    onSuccess: invalidate,
  });
}

export function useDemoteClubMember(clubId: string) {
  const invalidate = useInvalidateAfterRoleChange(clubId);

  return useMutation({
    mutationFn: (userId: string) => demoteClubMember(clubId, userId),
    onSuccess: invalidate,
  });
}

export function useRemoveClubMember(clubId: string) {
  const invalidate = useInvalidateAfterRoleChange(clubId);

  return useMutation({
    mutationFn: (userId: string) => removeClubMember(clubId, userId),
    onSuccess: invalidate,
  });
}
