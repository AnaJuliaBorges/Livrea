import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteHighlight,
  deleteReadingLog,
  deleteReview,
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
    queryClient.invalidateQueries({ queryKey: ["user-book-status", bookId] });
    queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    queryClient.invalidateQueries({ queryKey: ["book-reviews", bookId] });
    queryClient.invalidateQueries({ queryKey: ["club-book-rating"] });
  };
}

export function useSaveReadingProgress(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: ({
      currentPage,
      feeling,
      note,
    }: {
      currentPage: number;
      feeling: ReadingFeeling;
      note?: string;
    }) => saveReadingProgress(bookId!, currentPage, feeling, note),
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

export function useDeleteReadingLog(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: (logId: string) => deleteReadingLog(bookId!, logId),
    onSettled: invalidate,
  });
}

export function useDeleteHighlight(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: (highlightId: string) => deleteHighlight(highlightId),
    onSettled: invalidate,
  });
}

export function useDeleteReview(bookId?: string) {
  const invalidate = useInvalidateTracking(bookId);

  return useMutation({
    mutationFn: () => deleteReview(bookId!),
    onSettled: invalidate,
  });
}
