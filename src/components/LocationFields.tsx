import {
  useController,
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";
import {
  Field,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useStates, useCities } from "@/hooks/useLocations";

// Par Estado/Cidade para forms RHF que tenham os campos numéricos
// `state_id` e `city_id` (cadastro, edição de perfil). Autocontido:
// carrega estados/cidades, zera a cidade ao trocar o estado e resolve o
// rótulo manualmente no SelectValue (o Radix não resolve o rótulo de um
// valor controlado antes do dropdown abrir).
export function LocationFields<T extends FieldValues>({
  control,
  className = "grid grid-cols-2 gap-4",
}: {
  control: Control<T>;
  className?: string;
}) {
  const stateField = useController({ control, name: "state_id" as Path<T> });
  const cityField = useController({ control, name: "city_id" as Path<T> });

  const stateId = (stateField.field.value as number | undefined) || undefined;

  const { data: states } = useStates();
  const { data: cities } = useCities(stateId);

  return (
    <div className={className}>
      <Field>
        <Select
          value={stateField.field.value ? String(stateField.field.value) : ""}
          onValueChange={(value) => {
            stateField.field.onChange(Number(value));
            cityField.field.onChange(0 as PathValue<T, Path<T>>);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Estado">
              {stateField.field.value
                ? states?.find(
                    (state) =>
                      String(state.id) === String(stateField.field.value),
                  )?.name
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {states?.map((state) => (
                <SelectItem key={state.id} value={String(state.id)}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <Select
          value={cityField.field.value ? String(cityField.field.value) : ""}
          onValueChange={(value) => cityField.field.onChange(Number(value))}
          disabled={!stateId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Cidade">
              {cityField.field.value
                ? cities?.find(
                    (city) => String(city.id) === String(cityField.field.value),
                  )?.name
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {cities?.map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
