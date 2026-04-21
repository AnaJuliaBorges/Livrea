import { z } from "zod";

export const signupFirstStepSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  state_id: z.coerce.number("Selecione um estado"),
  city_id: z.coerce.number("Selecione uma cidade"),
  bio: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export type SignupFormData = z.infer<typeof signupFirstStepSchema>;
