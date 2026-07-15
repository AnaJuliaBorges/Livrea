import { Button } from "@/components/ui";
import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import placeholder from "../../../assets/placeholder.png";
import { LocalizationPin } from "@/components/LocalizationPin";
import { Tag } from "@/components/Tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewSection from "../components/OverviewSection";
import MembersSection from "../components/MemberSection";
import ReadingSection from "../components/ReadingSection";
import { useClub } from "../hooks/useClub";
import { useRequestToJoinClub } from "../hooks/useRequestToJoinClub";

export default function ClubDetails() {
  const { id } = useParams();
  const { data: club, isLoading, isError } = useClub(id);
  const navigate = useNavigate();
  const requestToJoin = useRequestToJoinClub(id ?? "");

  const handleRequestToJoin = () => {
    if (!club) return;

    requestToJoin.mutate(undefined, {
      onSuccess: () => {
        toast.success(
          club.isPrivate
            ? "Pedido enviado! Aguarde a aprovação do administrador."
            : "Você entrou no clube!",
        );
      },
      onError: (error) => {
        console.error("Error requesting to join club:", error);
        toast.error("Não foi possível enviar o pedido. Tente novamente.");
      },
    });
  };

  if (isLoading) {
    return (
      <p className="mt-20 text-center text-muted-foreground">
        Carregando clube...
      </p>
    );
  }

  if (isError || !club) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <p className="text-gray-600">
          Os detalhes deste clube não estão disponíveis.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 size-4" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="relative left-1/2 -mt-6 h-40 w-screen -translate-x-1/2 bg-linear-to-br from-violet-800 via-purple-900 to-slate-950">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 z-10 rounded-full text-accent-foreground hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="size-6" />
        </Button>

        {club.isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/clubes/${club.id}/configuracoes`)}
            className="absolute right-4 top-4 z-10 rounded-full text-accent-foreground hover:bg-white/20 hover:text-white"
          >
            <Settings className="size-6" />
          </Button>
        )}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-lg ">
          <img
            src={club.coverUrl ?? placeholder}
            alt={club.name}
            className="h-35 w-50 border-2 rounded-lg brightness-95 object-cover"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center mt-24 mb-6">
        <h2 className="font-medium text-lg">{club.name}</h2>
        {club.cityName && club.stateAbbreviation && (
          <LocalizationPin
            city={club.cityName}
            state={club.stateAbbreviation}
          />
        )}
        <div className="flex justify-center flex-wrap gap-2">
          {club.genres.map((genre) => (
            <Tag key={genre.id}>{genre.name}</Tag>
          ))}
        </div>
      </div>

      {!club.isMember && (
        <Button
          className="w-full mb-6"
          disabled={club.hasPendingRequest || requestToJoin.isPending}
          onClick={handleRequestToJoin}
        >
          {club.hasPendingRequest
            ? "Pedido enviado"
            : requestToJoin.isPending
              ? "Enviando..."
              : club.isPrivate
                ? "Pedir para participar"
                : "Entrar no clube"}
        </Button>
      )}

      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Participantes</TabsTrigger>
          <TabsTrigger value="reading">Leitura</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewSection club={club} />
        </TabsContent>
        <TabsContent value="members">
          <MembersSection club={club} />
        </TabsContent>
        <TabsContent value="reading">
          <ReadingSection club={club} />
        </TabsContent>
      </Tabs>
    </>
  );
}
