import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { FILTER_ALL, MEETING_TYPES } from "../constants";
import type { ClubListFilterValues } from "../utils/clubListFilters";
import type { Genre } from "../dtos";

type FilterOption = { value: string; label: string };

function FilterSelect({
  placeholder,
  ariaLabel,
  allLabel,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  ariaLabel: string;
  allLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="shrink-0" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectItem value={FILTER_ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function ClubListFilters({
  values,
  onChange,
  genres,
}: {
  values: ClubListFilterValues;
  onChange: (values: ClubListFilterValues) => void;
  genres: Genre[] | undefined;
}) {
  return (
    // rolagem horizontal sem barra visível: os selects não encolhem nem estouram a tela
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <FilterSelect
        placeholder="Tipo"
        ariaLabel="Filtrar por tipo"
        allLabel="Todos os tipos"
        value={values.type}
        onChange={(type) => onChange({ ...values, type })}
        options={MEETING_TYPES.map(({ value, label }) => ({ value, label }))}
      />

      <FilterSelect
        placeholder="Gênero"
        ariaLabel="Filtrar por gênero"
        allLabel="Todos os gêneros"
        value={values.genre}
        onChange={(genre) => onChange({ ...values, genre })}
        options={(genres ?? []).map((genre) => ({
          value: String(genre.id),
          label: genre.name,
        }))}
      />

      <FilterSelect
        placeholder="Privacidade"
        ariaLabel="Filtrar por privacidade"
        allLabel="Todas"
        value={values.privacy}
        onChange={(privacy) => onChange({ ...values, privacy })}
        options={[
          { value: "publico", label: "Público" },
          { value: "privado", label: "Privado" },
        ]}
      />
    </div>
  );
}
