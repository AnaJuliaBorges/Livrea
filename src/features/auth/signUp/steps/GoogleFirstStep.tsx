import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import { googleProfileStepSchema } from "../model/schema";
import { useSignup } from "../hooks/useSignUp";
import {
  Input,
  Field,
  FieldGroup,
  Textarea,
  FieldDescription,
} from "@/components/ui";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";
import { AvatarPicker } from "@/components/AvatarPicker";
import { LocationFields } from "@/components/LocationFields";

// Passo 1 do cadastro via Google: a conta já existe, então só completa o
// perfil — foto (pré-carregada do Google, trocável), bio e localização.
export default function GoogleFirstStep() {
  const data = useSignUpWizardStore((state) => state.data);
  const setStepButton = useSignUpWizardStore((state) => state.setStepButton);
  const { error, submitGoogleStep1 } = useSignup();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(googleProfileStepSchema),
    mode: "onChange",
    defaultValues: {
      name: data.account.name,
      bio: data.account.bio,
      state_id: data.account.state_id || undefined,
      city_id: data.account.city_id || undefined,
    },
  });

  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    setStepButton({ disabled: !isValid || isSubmitting });
  }, [isValid, isSubmitting, setStepButton]);

  return (
    <form
      id="signup-step-form"
      onSubmit={handleSubmit((formData) =>
        submitGoogleStep1(formData, avatarFile ?? undefined),
      )}
    >
      <div className="mb-6">
        <AvatarPicker
          name={name || ""}
          currentUrl={data.account.avatar_url}
          value={avatarFile}
          onChange={setAvatarFile}
          label="Trocar foto de perfil"
        />
      </div>
      <FieldGroup className="flex flex-col gap-4">
        <Field>
          <Input
            {...register("name")}
            id="name"
            type="text"
            placeholder="Nome"
            required
          />
          {errors.name && (
            <FieldDescription className="text-red-500">
              {errors.name.message}
            </FieldDescription>
          )}
        </Field>
        <LocationFields control={control} />
        <Field>
          <Textarea
            {...register("bio")}
            placeholder="Biografia (opcional)"
            className="h-32"
          />
          <FieldDescription className={errors.bio ? "text-red-500" : ""}>
            {errors.bio && errors.bio.message}
          </FieldDescription>
        </Field>
      </FieldGroup>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
    </form>
  );
}
