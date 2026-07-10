import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useDebounce } from "@/features/books/hooks/useDebounce";
import { useSearchBooks } from "@/features/books/hooks/useSearchBooks";
import { useGenres } from "@/features/books/hooks/useGenres";
import { getSelectedGenreNames } from "@/features/books/utils/genreUtils";

import type { Book } from "@/features/books/types/book";
import { useSignUpWizardStore } from "../../store/useSignUpWizardStore";
import { useSignUp } from "../..";

const schema = z.object({
  search: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function useThirdStepLogic() {
  const data = useSignUpWizardStore((state) => state.data);
  const { data: allGenres = [] } = useGenres();
  const { submitStep3 } = useSignUp();

  const [selectedBooks, setSelectedBooks] = useState<Book[]>(
    data.books.read || [],
  );

  const selectedGenreNames = useMemo(() => {
    return getSelectedGenreNames(data.genres, allGenres);
  }, [data.genres, allGenres]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      search: "",
    },
  });

  const searchValue = form.watch("search") || "";

  const debouncedSearch = useDebounce(searchValue, 500);

  const {
    data: dataBooks,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchBooks(
    searchValue ? [] : selectedGenreNames,
    searchValue ? debouncedSearch : undefined,
  );

  const books = useMemo(() => {
    return dataBooks ?? [];
  }, [dataBooks]);

  const selectedIds = useMemo(() => {
    return new Set(selectedBooks.map((book) => book.google_id));
  }, [selectedBooks]);

  function toggleBook(book: Book) {
    setSelectedBooks((prev) => {
      const exists = prev.some(
        (selected) => selected.google_id === book.google_id,
      );

      if (exists) {
        return prev.filter((selected) => selected.google_id !== book.google_id);
      }

      return [...prev, book];
    });
  }

  function handleNext() {
    submitStep3(selectedBooks);
  }

  return {
    form,
    searchValue,
    books,
    selectedIds,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    selectedBooks,
    toggleBook,
    handleNext,
    fetchNextPage,
  };
}
