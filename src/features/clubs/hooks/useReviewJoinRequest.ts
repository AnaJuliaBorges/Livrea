import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "../services/reviewJoinRequest";

function useInvalidateAfterReview(clubId: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["club-join-requests", clubId] });
    queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
    queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    queryClient.invalidateQueries({ queryKey: ["clubs"] });
  };
}

export function useApproveJoinRequest(clubId: string) {
  const invalidate = useInvalidateAfterReview(clubId);

  return useMutation({
    mutationFn: approveJoinRequest,
    onSuccess: invalidate,
  });
}

export function useRejectJoinRequest(clubId: string) {
  const invalidate = useInvalidateAfterReview(clubId);

  return useMutation({
    mutationFn: rejectJoinRequest,
    onSuccess: invalidate,
  });
}
