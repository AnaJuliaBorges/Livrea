import { useInfiniteQuery } from "@tanstack/react-query";
import { FEED_PAGE_SIZE, getFeed } from "../services/getFeed";

// Feed paginado por offset. Para de pedir quando a última página vem
// incompleta (menos que uma página cheia = acabou).
export function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => getFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < FEED_PAGE_SIZE ? undefined : allPages.length * FEED_PAGE_SIZE,
  });
}
