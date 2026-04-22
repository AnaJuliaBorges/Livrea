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

const secondStepSchema = z.object({
  genres: z.array(z.string()).refine((value) => value.length >= 3, {
    message: "Selecione pelo menos 3 gêneros",
  }),
});

type SecondStepFormData = z.infer<typeof secondStepSchema>;

interface SecondStepProps {
  onSubmitSuccess?: (data: SecondStepFormData) => void;
}

export default function SecondStep({ onSubmitSuccess }: SecondStepProps) {
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

  const onSubmit = async (data: SecondStepFormData) => {
    onSubmitSuccess?.(data);
  };

  if (isLoading) return <p>Carregando...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup>
          <FieldDescription
            className={errors.genres ? "text-red-500 mb-4" : "mb-4"}
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
                    checked={field.value.includes(genre.id.toString())}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value, genre.id.toString()]);
                      } else {
                        field.onChange(
                          field.value.filter(
                            (id) => id !== genre.id.toString(),
                          ),
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

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full"
        >
          Continuar
        </Button>
      </FieldSet>
    </form>
  );
}
