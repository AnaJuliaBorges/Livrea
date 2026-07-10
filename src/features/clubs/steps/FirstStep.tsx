import { Button, Field, FieldSet, Input, Textarea } from "@/components/ui";
import placeholder from "../../../assets/placeholder.png";
import { Download } from "lucide-react";
import { useCreateClubStore } from "../store/useCreateClubStore";

export function FirstStep({
  showValidation = false,
}: {
  showValidation?: boolean;
}) {
  const clubName = useCreateClubStore((state) => state.clubName);
  const description = useCreateClubStore((state) => state.description);
  const rules = useCreateClubStore((state) => state.rules);
  const setClubName = useCreateClubStore((state) => state.setClubName);
  const setDescription = useCreateClubStore((state) => state.setDescription);
  const setRules = useCreateClubStore((state) => state.setRules);

  const hasNameError = showValidation && !clubName.trim();
  const hasDescriptionError = showValidation && !description.trim();
  const hasRulesError = showValidation && !rules.trim();

  return (
    <>
      <div className="flex flex-col gap-2 items-center justify-center mb-8">
        <img
          src={placeholder}
          alt="Logo"
          className="h-32 w-45 border-2 rounded-lg brightness-95"
        />
        <Button variant="link">
          <Download />
          Carregar foto de capa
        </Button>
      </div>
      <form className="">
        <FieldSet className="gap-4">
          <Field>
            <Input
              id="club-name"
              value={clubName}
              onChange={(event) => setClubName(event.target.value)}
              placeholder="Nome"
            />
            {hasNameError && (
              <p className="text-sm text-red-500">Informe o nome do clube.</p>
            )}
          </Field>

          <Field>
            <Textarea
              id="club-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descrição"
              className="min-h-28"
            />
            {hasDescriptionError && (
              <p className="text-sm text-red-500">Descreva o clube.</p>
            )}
          </Field>

          <Field>
            <Textarea
              id="club-rules"
              value={rules}
              onChange={(event) => setRules(event.target.value)}
              placeholder="Regras"
              className="min-h-28"
            />
            {hasRulesError && (
              <p className="text-sm text-red-500">
                Informe as regras do clube.
              </p>
            )}
          </Field>
        </FieldSet>
      </form>
    </>
  );
}
