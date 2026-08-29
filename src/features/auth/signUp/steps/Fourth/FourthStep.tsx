import { BookResults } from "@/features/books";
import { useFourthStepLogic } from "./useFourthStepLogic";
import { SearchInput } from "@/components/shared/SearchInput";

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
    <form
      id="signup-step-form"
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
          event.preventDefault();
        }
      }}
    >
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
    </form>
  );
}
