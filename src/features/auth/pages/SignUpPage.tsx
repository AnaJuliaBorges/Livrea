import { Controller, useForm } from "react-hook-form";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { signupFirstStepSchema, type SignupFormData } from "../schema";
import { useSignup } from "../hooks/useSignUp";
import {
  Button,
  Input,
  Select,
  Field,
  Progress,
  Separator,
  FieldGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  Textarea,
  FieldDescription,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  useAuthRedirect("/clubes");
  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFirstStepSchema),
    mode: "onChange",
  });

  const { signup, useStates, useCities, error } = useSignup();

  const stateId = watch("state_id");

  const { data: states } = useStates();
  const { data: cities } = useCities(stateId);

  useEffect(() => {
    setValue("city_id", 0);
  }, [stateId, setValue]);

  const onSubmit = async (data: SignupFormData) => {
    console.log(data);
    await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          bio: data.bio,
          state_id: data.state_id,
          city_id: data.city_id,
        },
      },
    });
    // navigate("/clubes");
  };

  return (
    <div className="flex flex-col h-svh">
      <header className="grid grid-cols-3 items-center h-16 px-4">
        <div>
          <Button
            className="w-content"
            variant="link"
            onClick={() => navigate("/")}
          >
            <ArrowLeftIcon />
          </Button>
        </div>

        <div className="justify-self-center">
          <Progress value={33} className="w-[60%]" />
        </div>
      </header>

      <Separator className="mb-8" />

      <p className="text-center text-2xl mb-8">Olá, boas vindas ao Livrea!</p>

      <div className="flex w-full items-center justify-center">
        <div className="w-full max-w-sm">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
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
                        onValueChange={field.onChange}
                        value={field.value ? String(field.value) : ""}
                      >
                        <SelectTrigger className="w-full ">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            {states?.map((state) => (
                              <SelectItem
                                key={state.id}
                                value={String(state.id)}
                              >
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
                        onValueChange={field.onChange}
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
                <Textarea {...register("bio")} placeholder="Biografia" />
                <FieldDescription className={errors.bio ? "text-red-500" : ""}>
                  {errors.bio
                    ? errors.bio.message
                    : "Opcional. Máximo 200 caracteres."}
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full"
                onClick={() => handleSubmit}
              >
                Continuar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
