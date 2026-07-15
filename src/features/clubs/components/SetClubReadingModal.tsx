import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import placeholderBook from "../../../assets/book-placeholder.png";
import {
  searchClubReadingBooks,
  type ClubReadingSearchResult,
} from "../services/searchClubReadingBooks";
import { useSetClubReading } from "../hooks/useSetClubReading";

interface Props {
  clubId: string;
  onClose: () => void;
}

export function SetClubReadingModal({ clubId, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClubReadingSearchResult[] | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const setReading = useSetClubReading(clubId);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      toast.error("Digite pelo menos 3 letras para buscar.");
      return;
    }

    setIsSearching(true);
    try {
      setResults(await searchClubReadingBooks(trimmed));
    } catch (error) {
      console.error("Erro na busca de livros:", error);
      toast.error("Não foi possível buscar livros. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: ClubReadingSearchResult) => {
    setReading.mutate(result, {
      onSuccess: () => {
        toast.success(`"${result.title}" definido como leitura do clube!`);
        onClose();
      },
      onError: (error) => {
        console.error("Erro ao definir leitura:", error);
        const message =
          error instanceof Error && error.message ? error.message : null;
        toast.error(message ?? "Não foi possível definir a leitura.");
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 flex flex-col gap-4 max-h-[80vh]">
        <h2 className="text-lg font-medium">Definir leitura do clube</h2>

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome do livro"
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isSearching}>
            <Search />
          </Button>
        </form>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {isSearching && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Buscando livros...
            </p>
          )}

          {!isSearching && results?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhum livro encontrado. Tente outro nome.
            </p>
          )}

          {!isSearching &&
            results?.map((result) => (
              <button
                key={result.key}
                type="button"
                className="flex items-center gap-3 rounded-lg border p-2 text-left hover:bg-gray-50 disabled:opacity-50"
                disabled={setReading.isPending}
                onClick={() => handleSelect(result)}
              >
                <img
                  src={result.thumbnail ?? placeholderBook}
                  alt={result.title}
                  className="h-16 w-11 rounded object-cover bg-muted"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.authors.join(", ")}
                  </p>
                </div>
              </button>
            ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="link"
            onClick={onClose}
            disabled={setReading.isPending}
          >
            {setReading.isPending ? "Salvando..." : "Cancelar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
