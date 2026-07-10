import { useQuery } from "@tanstack/react-query";
import { getBook } from "../services/getBook";

export function useBook(id?: string) {
  return useQuery({
    queryKey: ["book", id],
    enabled: !!id,
    queryFn: () => getBook(id!),
  });
}
