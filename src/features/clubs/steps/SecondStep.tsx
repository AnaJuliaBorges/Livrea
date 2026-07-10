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
import { useCreateClubStore } from "../store/useCreateClubStore";

const frequencyOptions = [
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" },
  { value: "outro", label: "Outro" },
];

const stateOptions = [
  { value: "sp", label: "São Paulo" },
  { value: "rj", label: "Rio de Janeiro" },
  { value: "mg", label: "Minas Gerais" },
];

const cityOptions = {
  sp: ["São Paulo", "Campinas", "Santos"],
  rj: ["Rio de Janeiro", "Niterói", "Petrópolis"],
  mg: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"],
};

export function SecondStep({
  showValidation = false,
}: {
  showValidation?: boolean;
}) {
  const frequency = useCreateClubStore((state) => state.frequency);
  const customFrequency = useCreateClubStore((state) => state.customFrequency);
  const meetingType = useCreateClubStore((state) => state.meetingType);
  const state = useCreateClubStore((state) => state.state);
  const city = useCreateClubStore((state) => state.city);
  const meetingDescription = useCreateClubStore(
    (state) => state.meetingDescription,
  );
  const setFrequency = useCreateClubStore((state) => state.setFrequency);
  const setCustomFrequency = useCreateClubStore(
    (state) => state.setCustomFrequency,
  );
  const setMeetingType = useCreateClubStore((state) => state.setMeetingType);
  const setState = useCreateClubStore((state) => state.setState);
  const setCity = useCreateClubStore((state) => state.setCity);
  const setMeetingDescription = useCreateClubStore(
    (state) => state.setMeetingDescription,
  );

  const availableCities = state
    ? cityOptions[state as keyof typeof cityOptions]
    : [];

  const showCustomFrequencyInput = frequency === "outro";
  const hasCustomFrequencyError =
    showValidation && frequency === "outro" && !customFrequency.trim();
  const hasStateError = showValidation && !state;
  const hasCityError = showValidation && !city;

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
            <Select
              value={state}
              onValueChange={(value) => {
                setState(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasStateError && (
              <p className="text-sm text-red-500">Selecione o estado.</p>
            )}
          </Field>

          <Field>
            <Select value={city} onValueChange={setCity} disabled={!state}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
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
