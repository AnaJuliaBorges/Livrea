import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCities, useStates } from "@/hooks/useLocations";
import { useCreateClubStore } from "../store/useCreateClubStore";

const frequencyOptions = [
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "bimestral", label: "Bimestral" },
  { value: "outro", label: "Outro" },
];

export function SecondStep({
  showValidation = false,
}: {
  showValidation?: boolean;
}) {
  const frequency = useCreateClubStore((state) => state.frequency);
  const customFrequency = useCreateClubStore((state) => state.customFrequency);
  const meetingType = useCreateClubStore((state) => state.meetingType);
  const stateId = useCreateClubStore((state) => state.stateId);
  const cityId = useCreateClubStore((state) => state.cityId);
  const meetingDescription = useCreateClubStore(
    (state) => state.meetingDescription,
  );
  const setFrequency = useCreateClubStore((state) => state.setFrequency);
  const setCustomFrequency = useCreateClubStore(
    (state) => state.setCustomFrequency,
  );
  const setMeetingType = useCreateClubStore((state) => state.setMeetingType);
  const setStateId = useCreateClubStore((state) => state.setStateId);
  const setCityId = useCreateClubStore((state) => state.setCityId);
  const setMeetingDescription = useCreateClubStore(
    (state) => state.setMeetingDescription,
  );

  const { data: states, isLoading: isLoadingStates } = useStates();
  const { data: cities, isLoading: isLoadingCities } = useCities(
    stateId ? Number(stateId) : undefined,
  );

  const showCustomFrequencyInput = frequency === "outro";
  const hasCustomFrequencyError =
    showValidation && frequency === "outro" && !customFrequency.trim();
  const hasStateError = showValidation && !stateId;
  const hasCityError = showValidation && !cityId;

  return (
    <form className="">
      <FieldSet>
        <Field>
          <FieldLabel className="text-base">Frequência</FieldLabel>
          <Select
            value={frequency}
            onValueChange={(value) => {
              setFrequency(value);
              if (value !== "outro") {
                setCustomFrequency("");
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a frequencia " />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {showCustomFrequencyInput && (
          <Field>
            <FieldLabel>Informe a frequência desejada</FieldLabel>
            <Input
              value={customFrequency}
              onChange={(event) => setCustomFrequency(event.target.value)}
              placeholder="Ex.: a cada 45 dias"
            />
            {hasCustomFrequencyError && (
              <p className="text-sm text-red-500">
                Informe a frequência desejada.
              </p>
            )}
          </Field>
        )}

        <Field>
          <FieldLabel className="text-base">Tipo de encontros</FieldLabel>
          <RadioGroup value={meetingType} onValueChange={setMeetingType}>
            {[
              { value: "presencial", label: "Presencial" },
              { value: "hibrido", label: "Híbrido" },
              { value: "online", label: "Online" },
            ].map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label className="text-base font-normal" htmlFor={option.value}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Field>

        <FieldGroup className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <Field>
            <Select value={stateId} onValueChange={setStateId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingStates ? "Carregando..." : "Selecione o estado"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {states?.map((state) => (
                  <SelectItem key={state.id} value={String(state.id)}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasStateError && (
              <p className="text-sm text-red-500">Selecione o estado.</p>
            )}
          </Field>

          <Field>
            <Select value={cityId} onValueChange={setCityId} disabled={!stateId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    stateId && isLoadingCities
                      ? "Carregando..."
                      : "Selecione a cidade"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasCityError && (
              <p className="text-sm text-red-500">Selecione a cidade.</p>
            )}
          </Field>
        </FieldGroup>

        <Field>
          <FieldLabel className="text-base">Descrição dos encontros</FieldLabel>

          <Input
            id="encontro-description"
            value={meetingDescription}
            onChange={(event) => setMeetingDescription(event.target.value)}
            placeholder="Ex.: Toda última quinta do mês às 17h"
          />
        </Field>
      </FieldSet>
    </form>
  );
}
