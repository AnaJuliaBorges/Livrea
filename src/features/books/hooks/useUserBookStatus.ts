import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserBookStatus,
  setUserBookStatus,
  type UserBookStatus,
} from "../services/userBookStatus";

export function useUserBookStatus(bookId?: string) {
  return useQuery({
    queryKey: ["user-book-status", bookId],
    enabled: !!bookId,
    queryFn: () => getUserBookStatus(bookId!),
  });
}

export function useSetUserBookStatus(bookId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: UserBookStatus | null) =>
      setUserBookStatus(bookId!, status),

    // otimista: o select da página reflete a escolha na hora
    onMutate: async (status) => {
      await queryClient.cancelQueries({
        queryKey: ["user-book-status", bookId],
      });
      const previous = queryClient.getQueryData(["user-book-status", bookId]);
      queryClient.setQueryData(["user-book-status", bookId], status);
      return { previous };
    },

    onError: (_error, _status, context) => {
      queryClient.setQueryData(
        ["user-book-status", bookId],
        context?.previous ?? null,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-book-status", bookId] });
      // as listas Lido/Lendo/Quero ler do perfil vêm da mesma tabela
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}
