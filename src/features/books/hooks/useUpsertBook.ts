import { useMutation } from "@tanstack/react-query";
import { upsertBook } from "../services/upsertBook";

export function useUpsertBook() {
  return useMutation({
    mutationFn: upsertBook,
  });
}
