import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useDebounce } from "@/features/books/hooks/useDebounce";
import { useSearchBooks } from "@/features/books/hooks/useSearchBooks";
import { useGenres } from "@/features/books/hooks/useGenres";
import { getSelectedGenreNames } from "@/features/books/utils/genreUtils";

import type { Book } from "@/features/books/types/book";
import { useSignUpWizardStore } from "../../store/useSignUpWizardStore";
import { useSignUp } from "../../hooks";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  search: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function useFourthStepLogic() {
  const data = useSignUpWizardStore((state) => state.data);
  const resetWizard = useSignUpWizardStore((state) => state.reset);
  const setStepButton = useSignUpWizardStore((state) => state.setStepButton);
  const { data: allGenres = [] } = useGenres();
  const { submitStep4, loading: isSaving } = useSignUp();
  const navigate = useNavigate();

  const [selectedBooks, setSelectedBooks] = useState<Book[]>(
    data.books.wantRead || [],
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

  const alreadyReadIds = useMemo(() => {
    return new Set(data.books.read?.map((book) => book.google_id) || []);
  }, [data.books.read]);

  const books = useMemo(() => {
    return (dataBooks ?? []).filter(
      (book) => !alreadyReadIds.has(book.google_id),
    );
  }, [dataBooks, alreadyReadIds]);

  const selectedIds = useMemo(() => {
    return new Set(selectedBooks.map((book) => book.google_id));
  }, [selectedBooks]);

  useEffect(() => {
    setStepButton({
      label: isSaving ? "Salvando..." : "Finalizar",
      disabled: selectedIds.size === 0 || isSaving,
    });
  }, [selectedIds, isSaving, setStepButton]);

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
  async function handleSubmit() {
    await submitStep4(selectedBooks);

    navigate("/clubes");
    resetWizard();
  }

  return {
    form,
    searchValue,
    books,
    selectedIds,
    isLoading,
    isSaving,
    hasNextPage,
    isFetchingNextPage,
    toggleBook,
    handleSubmit,
    fetchNextPage,
  };
}
