import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldDescription,
} from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { useGenres } from "@/features/books";
import { useSignUp } from "../hooks";
import { useSignUpWizardStore } from "../store/useSignUpWizardStore";

const secondStepSchema = z.object({
  genres: z.array(z.number()).min(3),
});

export default function SecondStep() {
  const { data: genres, isLoading } = useGenres();
  const { submitStep2 } = useSignUp();
  const setStepButton = useSignUpWizardStore((state) => state.setStepButton);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(secondStepSchema),
    defaultValues: {
      genres: [],
    },
  });

  const selectedGenres = useWatch({ control, name: "genres" });

  useEffect(() => {
    setStepButton({ disabled: !isValid || isSubmitting });
  }, [isValid, isSubmitting, setStepButton]);

  if (isLoading) return <p>Carregando...</p>;

  return (
    <form id="signup-step-form" onSubmit={handleSubmit(submitStep2)}>
      <FieldSet>
        <FieldGroup>
          <FieldDescription
            className={errors.genres ? "text-red-500 mb-2" : "mb-2"}
          >
            {errors.genres?.message ||
              `Selecionados: ${selectedGenres.length} de 3 necessários`}
          </FieldDescription>
        </FieldGroup>
        <FieldGroup className="grid grid-cols-2 gap-6 mb-8">
          {genres?.map((genre) => (
            <Controller
              key={genre.id}
              control={control}
              name="genres"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id={`finder-pref-${genre.id}-checkbox`}
                    checked={field.value.includes(genre.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value, genre.id]);
                      } else {
                        field.onChange(
                          field.value.filter((id) => id !== genre.id),
                        );
                      }
                    }}
                  />
                  <FieldLabel
                    htmlFor={`finder-pref-${genre.id}-checkbox`}
                    className="font-normal cursor-pointer"
                  >
                    {genre.name}
                  </FieldLabel>
                </Field>
              )}
            />
          ))}
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
