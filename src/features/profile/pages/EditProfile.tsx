import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Button,
  Field,
  FieldDescription,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ALLOWED_IMAGE_MESSAGE, isAllowedImage } from "@/lib/imageUpload";
import { useStates, useCities } from "@/hooks/useLocations";
import { useMyProfile } from "../hooks/useMyProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useProfileHeaderColor } from "../hooks/useProfileHeaderColor";
import { uploadAvatar } from "../services/uploadAvatar";
import type { UserProfile } from "../dtos";
import { HEADER_COLORS, DEFAULT_HEADER_COLOR } from "@/lib/headerColors";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  // fora do RHF: não é campo validável, só uma escolha da paleta
  const [headerColor, setHeaderColor] = useState(initialHeaderColor);

  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : undefined),
    [avatarFile],
  );

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedImage(file)) {
      setAvatarError(ALLOWED_IMAGE_MESSAGE);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("A imagem deve ter no máximo 5MB");
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
  }

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
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

  const stateId = watch("state_id") as number | undefined;

  const { data: states } = useStates();
  const { data: cities } = useCities(stateId || undefined);

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

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

      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-32 w-32">
          <AvatarImage
            src={avatarPreview ?? profile.avatarUrl ?? undefined}
            alt={profile.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-300 text-3xl">
            {initials || <Camera className="h-8 w-8 text-gray-500" />}
          </AvatarFallback>
        </Avatar>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <Button
          type="button"
          variant="link"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera />
          Alterar foto de perfil
        </Button>

        {avatarError && (
          <FieldDescription className="text-red-500">
            {avatarError}
          </FieldDescription>
        )}
      </div>

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

        <div className="grid gap-4 grid-cols-2">
          <Controller
            control={control}
            name="state_id"
            render={({ field }) => (
              <Field>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                    setValue("city_id", 0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    {/* lookup manual: o Radix não resolve o rótulo de um
                        valor controlado antes do dropdown abrir */}
                    <SelectValue placeholder="Estado">
                      {field.value
                        ? states?.find(
                            (state) => String(state.id) === String(field.value),
                          )?.name
                        : undefined}
                    </SelectValue>
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
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                  disabled={!stateId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cidade">
                      {field.value
                        ? cities?.find(
                            (city) => String(city.id) === String(field.value),
                          )?.name
                        : undefined}
                    </SelectValue>
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
        </div>

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
