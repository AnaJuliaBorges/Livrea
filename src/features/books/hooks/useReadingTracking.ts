import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReadingTracking,
  saveHighlight,
  saveReadingProgress,
  saveReview,
  updateHighlight,
  type ReadingFeeling,
} from "../services/readingTracking";

export function useReadingTracking(bookId?: string) {
  return useQuery({
    queryKey: ["reading-tracking", bookId],
    enabled: !!bookId,
    queryFn: () => getReadingTracking(bookId!),
  });
}

function useInvalidateTracking(bookId?: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["reading-tracking", bookId] });
    // o progresso pode criar a linha na user_library (status "reading")
    queryClient.invalidateQueries({ queryKey: ["user-book-status", bookId] });
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  };
}

export function useSaveReadingProgress(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: ({
      currentPage,
      feeling,
    }: {
      currentPage: number;
      feeling: ReadingFeeling;
    }) => saveReadingProgress(bookId!, currentPage, feeling),
    onSettled: invalidate,
  });
}

export function useSaveHighlight(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: ({ page, quote }: { page: number; quote: string }) =>
      saveHighlight(bookId!, page, quote),
    onSettled: invalidate,
  });
}

export function useUpdateHighlight(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: ({
      highlightId,
      page,
      quote,
    }: {
      highlightId: string;
      page: number;
      quote: string;
    }) => updateHighlight(highlightId, page, quote),
    onSettled: invalidate,
  });
}

export function useSaveReview(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: ({ rating, review }: { rating: number; review: string }) =>
      saveReview(bookId!, rating, review),
    onSettled: invalidate,
  });
}
