import { useMutation } from "@tanstack/react-query";
import { saveUserBooks, type LibraryStatus } from "../services/saveUserBooks";
import type { Book } from "../types/book";

type Params = {
  books: Book[];
  status: LibraryStatus;
};

export function useSaveUserBooks() {
  return useMutation({
    mutationFn: ({ books, status }: Params) => saveUserBooks(books, status),
  });
}
