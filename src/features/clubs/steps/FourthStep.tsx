import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { useGenres } from "@/features/books";
import { useCreateClubStore } from "../store/useCreateClubStore";

export function FourthStep({
  showValidation = false,
}: {
  showValidation?: boolean;
}) {
  const { data: genres, isLoading } = useGenres();
  const selectedGenres = useCreateClubStore((state) => state.selectedGenres);
  const toggleGenre = useCreateClubStore((state) => state.toggleGenre);
  const hasGenresError = showValidation && selectedGenres.length === 0;

  if (isLoading) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Carregando gêneros...
      </p>
    );
  }

  return (
    <form>
      <FieldSet>
        <FieldDescription className="text-center">
          Selecione os gêneros que melhor representam o clube.
        </FieldDescription>
        {hasGenresError && (
          <p className="text-center text-sm text-red-500">
            Selecione pelo menos um gênero.
          </p>
        )}

        <FieldGroup className="grid grid-cols-2 gap-3">
          {genres?.map((genre) => {
            const checked = selectedGenres.includes(genre.id);
            const checkboxId = `club-genre-${genre.id}`;

            return (
              <div key={genre.id} className="flex items-center gap-2 px-3 py-2">
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onCheckedChange={() => toggleGenre(genre.id)}
                />
                <FieldLabel
                  htmlFor={checkboxId}
                  className="cursor-pointer font-normal"
                >
                  {genre.name}
                </FieldLabel>
              </div>
            );
          })}
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
