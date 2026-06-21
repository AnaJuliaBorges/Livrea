import { Button } from "@/components/ui/button";

import { BookResults } from "@/features/books/components/BookResults";
import { useFourthStepLogic } from "./useFourthStepLogic";
import { SearchInput } from "@/components/SearchInput";

export default function FourthStep() {
  const {
    form,
    searchValue,
    books,
    selectedIds,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    toggleBook,
    handleSubmit,
    fetchNextPage,
  } = useFourthStepLogic();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Livros que você quer ler</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Escolha alguns livros que gostaria de ler em seguida.
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
          onClick={handleSubmit}
          disabled={selectedIds.size === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? "Salvando..." : "Finalizar"}
        </Button>
      </div>
    </div>
  );
}
