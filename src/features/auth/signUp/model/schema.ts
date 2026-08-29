import { z } from "zod";

export const signupFirstStepSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  state_id: z.coerce.number().min(1, "Selecione um estado"),
  city_id: z.coerce.number().min(1, "Selecione uma cidade"),
  bio: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export const googleProfileStepSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  state_id: z.number().min(1, "Selecione um estado"),
  city_id: z.number().min(1, "Selecione uma cidade"),
  bio: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export type GoogleProfileFormInput = z.infer<typeof googleProfileStepSchema>;

export const SecondStepSchema = z.object({
  genres: z.array(z.number()).min(3),
});

export type SignupFormInput = {
  name: string;
  email: string;
  password: string;
  bio?: string;
  state_id: number;
  city_id: number;
};

export type SecondStepFormData = z.infer<typeof SecondStepSchema>;
