import { useMutation } from "@tanstack/react-query";
import { saveProfileGenres } from "../services/saveProfileGenres";

type Params = {
  userId: string;
  genreIds: number[];
};

export function useSaveProfileGenres() {
  return useMutation({
    mutationFn: ({ userId, genreIds }: Params) =>
      saveProfileGenres(userId, genreIds),
  });
}
