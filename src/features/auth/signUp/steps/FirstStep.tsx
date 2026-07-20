import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import { signupFirstStepSchema } from "../model/schema";
import { useSignup } from "../hooks/useSignUp";
import {
  Input,
  Field,
  FieldGroup,
  Textarea,
  FieldDescription,
} from "@/components/ui";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";
import { AvatarPicker } from "@/components/shared/AvatarPicker";
import { LocationFields } from "@/components/shared/LocationFields";

export default function FirstStep() {
  const data = useSignUpWizardStore((state) => state.data);
  const setStepButton = useSignUpWizardStore((state) => state.setStepButton);
  const { error, submitStep1 } = useSignup();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(signupFirstStepSchema),
    mode: "onChange",
    defaultValues: {
      name: data.account.name,
      email: data.account.email,
      password: data.account.password,
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
        submitStep1(formData, avatarFile ?? undefined),
      )}
    >
      <div className="mb-6">
        <AvatarPicker
          name={name || ""}
          value={avatarFile}
          onChange={setAvatarFile}
          label={avatarFile ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
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
        <Field>
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder="Email"
            required
          />
          {errors.email && (
            <FieldDescription className="text-red-500">
              {errors.email.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Input
            {...register("password")}
            id="password"
            type="password"
            placeholder="Senha"
            required
          />
          {errors.password && (
            <FieldDescription className="text-red-500">
              {errors.password.message}
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
