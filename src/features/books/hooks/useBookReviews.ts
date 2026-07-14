import { useQuery } from "@tanstack/react-query";
import { getBookReviews } from "../services/getBookReviews";

export function useBookReviews(bookId?: string) {
  return useQuery({
    queryKey: ["book-reviews", bookId],
    enabled: !!bookId,
    queryFn: () => getBookReviews(bookId!),
  });
}
