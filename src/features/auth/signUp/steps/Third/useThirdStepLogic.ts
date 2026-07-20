import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useDebounce } from "@/features/books";
import { useSearchBooks } from "@/features/books";
import { useGenres } from "@/features/books";
import { getSelectedGenreNames } from "@/features/books";

import type { Book } from "@/features/books";
import { useSignUpWizardStore } from "../../store/useSignUpWizardStore";
import { useSignUp } from "../..";

const schema = z.object({
  search: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function useThirdStepLogic() {
  const data = useSignUpWizardStore((state) => state.data);
  const setStepButton = useSignUpWizardStore((state) => state.setStepButton);
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

  const searchValue =
    useWatch({ control: form.control, name: "search" }) || "";

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

  useEffect(() => {
    setStepButton({ disabled: selectedIds.size === 0 });
  }, [selectedIds, setStepButton]);

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
