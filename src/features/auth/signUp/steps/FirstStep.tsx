import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { signupFirstStepSchema } from "../model/schema";
import { useSignup } from "../hooks/useSignUp";
import {
  Button,
  Input,
  Select,
  Field,
  FieldGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  Textarea,
  FieldDescription,
} from "@/components/ui";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download } from "lucide-react";

export default function FirstStep() {
  const data = useSignUpWizardStore((state) => state.data);
  const { useStates, useCities, error, submitStep1 } = useSignup();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
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

  const stateId = watch("state_id") as number | undefined;

  const { data: states } = useStates();
  const { data: cities } = useCities(stateId!);

  useEffect(() => {
    setValue("city_id", 0);
  }, [stateId, setValue]);

  return (
    <form onSubmit={handleSubmit(submitStep1)}>
      <div className="flex flex-col items-center gap-2 mb-6">
        <Avatar className="h-28 w-28">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback className="bg-gray-300">AJ</AvatarFallback>
        </Avatar>

        <Button variant="link">
          <Download />
          Alterar foto de perfil
        </Button>
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
        <Field className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="state_id"
            render={({ field }) => (
              <Field>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : ""}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Estado" />
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
            )}
          />
          <Controller
            control={control}
            name="city_id"
            render={({ field }) => (
              <Field>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : ""}
                  disabled={!stateId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cidade" />
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
            )}
          />
        </Field>
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

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full"
        >
          Continuar
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
    </form>
  );
}
