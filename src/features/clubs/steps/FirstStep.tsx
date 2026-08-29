import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Button, Field, FieldSet, Input, Textarea } from "@/components/ui";
import placeholder from "../../../assets/placeholder.png";
import { Download } from "lucide-react";
import { useCreateClubStore } from "../store/useCreateClubStore";
import { ALLOWED_IMAGE_MESSAGE, isAllowedImage } from "@/lib/imageUpload";

const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

export function FirstStep({
  showValidation = false,
}: {
  showValidation?: boolean;
}) {
  const clubName = useCreateClubStore((state) => state.clubName);
  const description = useCreateClubStore((state) => state.description);
  const rules = useCreateClubStore((state) => state.rules);
  const coverFile = useCreateClubStore((state) => state.coverFile);
  const setClubName = useCreateClubStore((state) => state.setClubName);
  const setDescription = useCreateClubStore((state) => state.setDescription);
  const setRules = useCreateClubStore((state) => state.setRules);
  const setCoverFile = useCreateClubStore((state) => state.setCoverFile);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!isAllowedImage(file)) {
      toast.error(ALLOWED_IMAGE_MESSAGE);
      return;
    }

    if (file.size > MAX_COVER_SIZE) {
      toast.error("A imagem da capa deve ter no máximo 5MB.");
      return;
    }

    setCoverFile(file);
  };

  const hasNameError = showValidation && !clubName.trim();
  const hasDescriptionError = showValidation && !description.trim();
  const hasRulesError = showValidation && !rules.trim();

  return (
    <>
      <div className="flex flex-col gap-2 items-center justify-center mb-8">
        <img
          src={previewUrl ?? placeholder}
          alt="Capa do clube"
          className="h-32 w-45 border-2 rounded-lg brightness-95 object-cover"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
        <Button
          type="button"
          variant="link"
          onClick={() => fileInputRef.current?.click()}
        >
          <Download />
          {coverFile ? "Trocar foto de capa" : "Carregar foto de capa"}
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
