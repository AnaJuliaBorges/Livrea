import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Button,
  Field,
  FieldDescription,
  Input,
  Textarea,
} from "@/components/ui";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AvatarPicker } from "@/components/shared/AvatarPicker";
import { LocationFields } from "@/components/shared/LocationFields";
import { useMyProfile } from "../hooks/useMyProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useProfileHeaderColor } from "../hooks/useProfileHeaderColor";
import { uploadAvatar } from "../services/uploadAvatar";
import type { UserProfile } from "../dtos";
import { HEADER_COLORS, DEFAULT_HEADER_COLOR } from "@/lib/headerColors";

const editProfileSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.email("Email inválido"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
  state_id: z.coerce.number().min(1, "Selecione um estado"),
  city_id: z.coerce.number().min(1, "Selecione uma cidade"),
  bio: z.string().max(200, "Máximo 200 caracteres").optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

// O wrapper só libera o form quando os dados existem — assim o
// useForm nasce com defaultValues corretos e não precisa de reset()
// tardio (que vive brigando com cache, autofill e ordem das queries).
export function EditProfile() {
  const { data: profile, isLoading } = useMyProfile();

  const { data: authUser, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: headerColor, isLoading: isLoadingColor } =
    useProfileHeaderColor(profile?.id);

  if (isLoading || isLoadingAuth || isLoadingColor) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Carregando perfil...
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Não foi possível carregar o perfil. Tente novamente.
      </p>
    );
  }

  return (
    <EditProfileForm
      profile={profile}
      email={authUser?.email ?? ""}
      initialHeaderColor={headerColor ?? DEFAULT_HEADER_COLOR}
    />
  );
}

function EditProfileForm({
  profile,
  email,
  initialHeaderColor,
}: {
  profile: UserProfile;
  email: string;
  initialHeaderColor: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: saveProfile } = useUpdateProfile();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // fora do RHF: não é campo validável, só uma escolha da paleta
  const [headerColor, setHeaderColor] = useState(initialHeaderColor);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<z.input<typeof editProfileSchema>, unknown, EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: profile.name,
      email,
      password: "",
      state_id: profile.stateId ?? 0,
      city_id: profile.cityId ?? 0,
      bio: profile.bio ?? "",
    },
  });

  async function onSubmit(data: EditProfileFormData) {
    try {
      await saveProfile({
        userId: profile.id,
        name: data.name,
        bio: data.bio || null,
        stateId: data.state_id,
        cityId: data.city_id,
        headerColor,
      });

      if (avatarFile) {
        await uploadAvatar(profile.id, avatarFile);
      }

      if (data.email && data.email !== email) {
        const { error } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (error) throw error;
        toast.info("Confira sua caixa de entrada para confirmar o novo email");
      }

      if (data.password) {
        const { error } = await supabase.auth.updateUser({
          password: data.password,
        });
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await queryClient.invalidateQueries({
        queryKey: ["profile-header-color", profile.id],
      });

      toast.success("Perfil atualizado!");
      navigate("/perfil");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar o perfil",
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/login");
  }

  return (
    <div className="flex flex-col gap-4 mb-10 md:mx-auto md:w-full md:max-w-2xl">
      <button
        type="button"
        className="mb-5 flex items-center gap-4 border-b py-5 text-left"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="md:hidden" />
        <h2>Configurações</h2>
      </button>

      <AvatarPicker
        name={profile.name}
        currentUrl={profile.avatarUrl}
        value={avatarFile}
        onChange={setAvatarFile}
        label="Alterar foto de perfil"
        className="h-32 w-32"
        fallbackClassName="bg-gray-300 text-3xl"
      />

      <form
        id="edit-profile-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Field>
          <Input {...register("name")} placeholder="Nome" />
          {errors.name && (
            <FieldDescription className="text-red-500">
              {errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Input {...register("email")} type="email" placeholder="Email" />
          {errors.email && (
            <FieldDescription className="text-red-500">
              {errors.email.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Input
            {...register("password")}
            type="password"
            placeholder="Nova senha (deixe em branco para manter)"
          />
          {errors.password && (
            <FieldDescription className="text-red-500">
              {errors.password.message}
            </FieldDescription>
          )}
        </Field>

        <LocationFields control={control} className="grid gap-4 grid-cols-2" />

        <Field>
          <Textarea
            {...register("bio")}
            placeholder="Biografia"
            className="min-h-28"
          />
          {errors.bio && (
            <FieldDescription className="text-red-500">
              {errors.bio.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldDescription>Cor do cabeçalho do perfil</FieldDescription>
          <div className="flex flex-wrap gap-3">
            {Object.entries(HEADER_COLORS).map(([key, { label, gradient }]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={headerColor === key}
                onClick={() => setHeaderColor(key)}
                className={`size-9 rounded-full ${gradient} transition ${
                  headerColor === key
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </Field>
      </form>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          form="edit-profile-form"
          className="h-12"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="link"
          className="text-destructive self-start text-sm"
          onClick={handleLogout}
        >
          Sair da conta
          <LogOut />
        </Button>
      </div>
    </div>
  );
}
