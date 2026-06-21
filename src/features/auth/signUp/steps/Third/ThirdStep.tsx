import { Button } from "@/components/ui/button";

import { BookResults } from "@/features/books/components/BookResults";
import { useThirdStepLogic } from "./useThirdStepLogic";
import { SearchInput } from "@/components/SearchInput";

export default function ThirdStep() {
  const {
    form,
    searchValue,
    books,
    selectedIds,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    toggleBook,
    handleNext,
    fetchNextPage,
  } = useThirdStepLogic();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Livros que você já leu</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Escolha alguns livros para personalizar recomendações.
        </p>
      </div>

      <SearchInput
        value={searchValue}
        onChange={(value) => form.setValue("search", value)}
        placeholder="Buscar livros..."
      />

      <div className="overflow-auto pr-2">
        <BookResults
          books={books}
          selectedIds={selectedIds}
          onToggle={toggleBook}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
        />
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
        <Button
          type="button"
          onClick={handleNext}
          disabled={selectedIds.size === 0}
          className="w-full"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
