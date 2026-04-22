import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldDescription,
  Button,
} from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { useGenres } from "@/features/books/hooks/useGenres";
import { useSignUpWizardContext } from "../context/useSignupWizardContext";
import { useSaveProfileGenres } from "@/features/profile/hooks/useSaveProfileGenres";
import { supabase } from "@/lib/supabase";

const secondStepSchema = z.object({
  genres: z.array(z.number()).min(3),
});

type SecondStepFormData = z.infer<typeof secondStepSchema>;

export default function SecondStep() {
  const { data, update, nextStep } = useSignUpWizardContext();
  const { mutateAsync } = useSaveProfileGenres();
  const { data: genres, isLoading } = useGenres();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SecondStepFormData>({
    resolver: zodResolver(secondStepSchema),
    defaultValues: {
      genres: [],
    },
  });

  const selectedGenres = watch("genres");

  const onSubmit = async (formData: SecondStepFormData) => {
    const genres = formData.genres.map(Number);

    update("genres", genres);

    await mutateAsync({
      userId: data.account.user_id!,
      genreIds: genres,
    });

    nextStep();
  };

  if (isLoading) return <p>Carregando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      </FieldSet>
    </form>
  );
}
