import { Button } from "@/components/ui";
import { ArrowLeft, MessageCircleMore, Send, Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import placeholder from "../../../assets/placeholder.png";
import { BackButton } from "@/components/shared/BackButton";
import { LocalizationPin } from "@/components/shared/LocalizationPin";
import { Tag } from "@/components/shared/Tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewSection from "../components/OverviewSection";
import MembersSection from "../components/MemberSection";
import ReadingSection from "../components/reading/ReadingSection";
import { useClub } from "../hooks/useClub";
import { useRequestToJoinClub } from "../hooks/useRequestToJoinClub";
import { useLeaveClub } from "../hooks/useLeaveClub";
import { LeaveClubDialog } from "../components/LeaveClubDialog";
import { headerGradient } from "@/lib/headerColors";
import { useState } from "react";

export default function ClubDetails() {
  const { id } = useParams();
  const { data: club, isLoading, isError } = useClub(id);
  const navigate = useNavigate();
  const requestToJoin = useRequestToJoinClub(id ?? "");
  const leaveClub = useLeaveClub(id ?? "");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleLeaveClub = () => {
    leaveClub.mutate(undefined, {
      onSuccess: () => {
        setShowLeaveDialog(false);
        toast.success("Você saiu do clube.");
        navigate("/clubes");
      },
      onError: (error) => {
        console.error("Error leaving club:", error);
        toast.error("Não foi possível sair do clube. Tente novamente.");
      },
    });
  };

  const handleShare = async () => {
    if (!club) return;

    const url = `${window.location.origin}/clubes/${club.id}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: club.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link do clube copiado!");
      }
    } catch (error) {
      // usuário fechou o menu de compartilhar — não é erro
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Não foi possível compartilhar o link.");
    }
  };

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
      <div
        className={`relative left-1/2 -mt-6 h-40 w-screen -translate-x-1/2 md:bg-none ${headerGradient(club.headerColor)}`}
      >
        <BackButton className="absolute left-4 top-4 z-10 text-gray-300 hover:bg-white/20 md:hidden" />

        {club.isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/clubes/${club.id}/configuracoes`)}
            className="absolute right-4 top-4 z-10 rounded-full text-gray-300 hover:bg-white/20 md:text-gray-500 md:hover:bg-gray-100"
          >
            <Settings className="size-6" />
          </Button>
        )}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-lg ">
          <Button
            size="icon"
            aria-label="Compartilhar clube"
            onClick={handleShare}
            className="absolute top-[55%] -left-14 -translate-y-1/2 rounded-full text-black border bg-gray-100 hover:bg-gray-300"
          >
            <Send className="size-5" />
          </Button>
          <img
            src={club.coverUrl ?? placeholder}
            alt={club.name}
            className="h-35 w-50 border-2 rounded-lg brightness-95 object-cover"
          />

          {club.isMember && (
            <Button
              size="icon"
              aria-label="Chat do clube"
              onClick={() => navigate(`/clubes/${club.id}/chat`)}
              className="absolute top-[55%] -right-14 -translate-y-1/2 rounded-full text-black border bg-gray-100 hover:bg-gray-300"
            >
              <MessageCircleMore className="size-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center mt-24 mb-6 md:mx-auto md:w-full md:max-w-3xl">
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
          className="w-full mb-6 md:mx-auto md:flex md:max-w-3xl"
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

      <Tabs defaultValue="overview" className="w-full mb-8 md:mx-auto md:max-w-3xl">
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
          {club.isMember && !club.isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setShowLeaveDialog(true)}
            >
              Sair do clube
            </Button>
          )}
        </TabsContent>
        <TabsContent value="reading">
          <ReadingSection club={club} />
        </TabsContent>
      </Tabs>

      {showLeaveDialog && (
        <LeaveClubDialog
          clubName={club.name}
          isLeaving={leaveClub.isPending}
          onConfirm={handleLeaveClub}
          onClose={() => setShowLeaveDialog(false)}
        />
      )}
    </>
  );
}
