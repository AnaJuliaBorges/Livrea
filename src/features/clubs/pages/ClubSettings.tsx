import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useStates, useCities } from "@/hooks/useLocations";
import { useGenres } from "@/features/books/hooks/useGenres";
import { useClub } from "../hooks/useClub";
import { useUpdateClub } from "../hooks/useUpdateClub";
import { useDeleteClub } from "../hooks/useDeleteClub";
import { DeleteClubDialog } from "../components/DeleteClubDialog";
import type { Club } from "../dtos";

// enum club_meeting_type do banco <-> valor pt usado no formulário
const meetingTypeToPt: Record<string, string> = {
  in_person: "presencial",
  hybrid: "hibrido",
  online: "online",
};
const meetingTypeToEnum: Record<string, string> = {
  presencial: "in_person",
  hibrido: "hybrid",
  online: "online",
};

function ClubSettingsForm({ club }: { club: Club }) {
  const navigate = useNavigate();
  const updateClub = useUpdateClub(club.id);
  const deleteClub = useDeleteClub();

  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description);
  const [rules, setRules] = useState(club.rules);
  const [selectedGenres, setSelectedGenres] = useState(
    club.genres.map((genre) => genre.id),
  );
  const [stateId, setStateIdState] = useState(
    club.stateId ? String(club.stateId) : "",
  );
  const [cityId, setCityId] = useState(club.cityId ? String(club.cityId) : "");
  const [meetingType, setMeetingType] = useState(
    meetingTypeToPt[club.type] ?? "presencial",
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: genres, isLoading: isLoadingGenres } = useGenres();
  const { data: states, isLoading: isLoadingStates } = useStates();
  const { data: cities, isLoading: isLoadingCities } = useCities(
    stateId ? Number(stateId) : undefined,
  );

  const setStateId = (value: string) => {
    setStateIdState(value);
    setCityId("");
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((current) =>
      current.includes(genreId)
        ? current.filter((id) => id !== genreId)
        : [...current, genreId],
    );
  };

  const hasChanges =
    name.trim() !== club.name ||
    description !== club.description ||
    rules !== club.rules ||
    JSON.stringify([...selectedGenres].sort()) !==
      JSON.stringify([...club.genres.map((g) => g.id)].sort()) ||
    cityId !== (club.cityId ? String(club.cityId) : "") ||
    meetingType !== (meetingTypeToPt[club.type] ?? "presencial");

  const handleSave = () => {
    if (!name.trim() || selectedGenres.length === 0 || !cityId) {
      toast.error("Preencha nome, cidade e ao menos um gênero.");
      return;
    }

    updateClub.mutate(
      {
        clubId: club.id,
        name: name.trim(),
        description,
        rules,
        genreIds: selectedGenres,
        cityId: Number(cityId),
        meetingType: meetingTypeToEnum[meetingType],
      },
      {
        onSuccess: () => {
          toast.success("Configurações salvas!");
          navigate(`/clubes/${club.id}`);
        },
        onError: (error) => {
          console.error("Error updating club settings:", error);
          toast.error("Não foi possível salvar. Tente novamente.");
        },
      },
    );
  };

  const handleDeleteClub = () => {
    deleteClub.mutate(club.id, {
      onSuccess: () => {
        toast.success("Clube excluído.");
        navigate("/meus-clubes");
      },
      onError: (error) => {
        console.error("Error deleting club:", error);
        toast.error("Não foi possível excluir o clube. Tente novamente.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-medium">Configurações do clube</h1>
      </div>

      <FieldSet className="gap-4">
        <Field>
          <FieldLabel>Nome do clube</FieldLabel>
          <Input
            placeholder="Nome do clube"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>Descrição</FieldLabel>
          <Textarea
            placeholder="Descrição do clube"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-24"
          />
        </Field>

        <Field>
          <FieldLabel>Regras de participação</FieldLabel>
          <Textarea
            placeholder="Regras de participação"
            value={rules}
            onChange={(event) => setRules(event.target.value)}
            className="min-h-24"
          />
        </Field>

        <Field>
          <FieldLabel>Gêneros</FieldLabel>
          {isLoadingGenres ? (
            <p className="text-sm text-muted-foreground">
              Carregando gêneros...
            </p>
          ) : (
            <FieldGroup className="grid grid-cols-2 gap-3">
              {genres?.map((genre) => {
                const checked = selectedGenres.includes(genre.id);
                const checkboxId = `settings-genre-${genre.id}`;

                return (
                  <div key={genre.id} className="flex items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={() => toggleGenre(genre.id)}
                    />
                    <FieldLabel
                      htmlFor={checkboxId}
                      className="cursor-pointer font-normal"
                    >
                      {genre.name}
                    </FieldLabel>
                  </div>
                );
              })}
            </FieldGroup>
          )}
        </Field>

        <Field>
          <FieldLabel>Tipo de encontros</FieldLabel>
          <RadioGroup value={meetingType} onValueChange={setMeetingType}>
            {[
              { value: "presencial", label: "Presencial" },
              { value: "hibrido", label: "Híbrido" },
              { value: "online", label: "Online" },
            ].map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label className="font-normal" htmlFor={option.value}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Field>

        <FieldGroup className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Estado</FieldLabel>
            <Select value={stateId} onValueChange={setStateId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingStates ? "Carregando..." : "Selecione o estado"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {states?.map((state) => (
                  <SelectItem key={state.id} value={String(state.id)}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Cidade</FieldLabel>
            <Select
              value={cityId}
              onValueChange={setCityId}
              disabled={!stateId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    stateId && isLoadingCities
                      ? "Carregando..."
                      : "Selecione a cidade"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cities?.map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button
        className="w-full"
        disabled={!hasChanges || updateClub.isPending}
        onClick={handleSave}
      >
        {updateClub.isPending ? "Salvando..." : "Salvar alterações"}
      </Button>

      {club.isOwner && (
        <Button
          variant="ghost"
          className="w-full text-destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          Excluir clube
        </Button>
      )}

      {showDeleteDialog && (
        <DeleteClubDialog
          clubName={club.name}
          isDeleting={deleteClub.isPending}
          onConfirm={handleDeleteClub}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}

export default function ClubSettings() {
  const { id } = useParams();
  const { data: club, isLoading, isError } = useClub(id);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Carregando clube...
      </p>
    );
  }

  if (isError || !club || !club.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <p className="text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 size-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return <ClubSettingsForm club={club} />;
}
