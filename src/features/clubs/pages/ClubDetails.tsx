import { Button } from "@/components/ui";
import { allClubs } from "@/mocks/clubes";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import placeholder from "../../../assets/placeholder.png";
import { LocalizationPin } from "@/components/LocalizationPin";
import { Tag } from "@/components/Tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewSection from "../components/OverviewSection";
import MembersSection from "../components/MemberSection";
import ReadingSection from "../components/ReadingSection";

export default function ClubDetails() {
  const { id } = useParams();
  const club = allClubs.find((item) => item.id === id);
  const navigate = useNavigate();

  // A página de detalhes ainda é alimentada por mock (allClubs); clubes reais
  // criados no banco ainda não têm detalhe — não deixar a página quebrar.
  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <p className="text-gray-600">
          Os detalhes deste clube ainda não estão disponíveis.
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

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 rounded-lg ">
          <img
            src={placeholder}
            alt="Logo"
            className="h-35 w-50 border-2 rounded-lg brightness-95"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center mt-24">
        <h2 className="font-medium text-lg">{club?.name}</h2>
        <LocalizationPin city={club?.cityName} state={club?.stateAbbreviation} />
        <div className="flex gap-2">
          {club?.genres.map((genre) => (
            <Tag>{genre.name}</Tag>
          ))}
        </div>
      </div>

      <Button className="w-full my-6">Pedir para participar</Button>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Participantes</TabsTrigger>
          <TabsTrigger value="reading">Leitura</TabsTrigger>
        </TabsList>
        {club && (
          <>
            <TabsContent value="overview">
              <OverviewSection club={club} />
            </TabsContent>
            <TabsContent value="members">
              <MembersSection />
            </TabsContent>
            <TabsContent value="reading">
              <ReadingSection club={club} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </>
  );
}
