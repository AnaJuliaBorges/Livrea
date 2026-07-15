import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldSet,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateClubStore } from "../store/useCreateClubStore";

export function ThirdStep({
  showValidation = false,
}: {
  showValidation?: boolean;
}) {
  const privacy = useCreateClubStore((state) => state.privacy);
  const hasLimit = useCreateClubStore((state) => state.hasLimit);
  const maxParticipants = useCreateClubStore((state) => state.maxParticipants);
  const setPrivacy = useCreateClubStore((state) => state.setPrivacy);
  const setHasLimit = useCreateClubStore((state) => state.setHasLimit);
  const setMaxParticipants = useCreateClubStore(
    (state) => state.setMaxParticipants,
  );

  const hasPrivacyError = showValidation && !privacy;
  const hasLimitError = showValidation && !hasLimit;
  const hasParticipantsError =
    showValidation && hasLimit === "sim" && !maxParticipants;

  return (
    <form className="">
      <FieldSet className="gap-4">
        <Field>
          <FieldLabel className="text-base">Privacidade do clube</FieldLabel>

          <RadioGroup value={privacy} onValueChange={setPrivacy}>
            {[
              { value: "publico", label: "Aberto a qualquer participante" },
              {
                value: "privado",
                label: "Fechado, entrada mediante aprovação",
              },
            ].map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label className="text-base font-normal" htmlFor={option.value}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {hasPrivacyError && (
            <p className="text-sm text-red-500">
              Selecione a privacidade do clube.
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel className="text-base">
            Limite de participantes?
          </FieldLabel>
          <RadioGroup value={hasLimit} onValueChange={setHasLimit}>
            {[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ].map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label className="text-base font-normal" htmlFor={option.value}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {hasLimitError && (
            <p className="text-sm text-red-500">
              Defina se há limite de participantes.
            </p>
          )}
        </Field>

        {hasLimit === "sim" && (
          <Field>
            <FieldLabel>Máximo de participantes</FieldLabel>
            <Select value={maxParticipants} onValueChange={setMaxParticipants}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a quantidade" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Defina o limite máximo de membros para o clube.
            </FieldDescription>
            {hasParticipantsError && (
              <p className="text-sm text-red-500">
                Selecione a quantidade máxima de participantes.
              </p>
            )}
          </Field>
        )}
      </FieldSet>
    </form>
  );
}
