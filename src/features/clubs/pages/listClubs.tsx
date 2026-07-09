import { MapPin } from "lucide-react";
import ItemClub from "../components/itemClub";
import { useListClubs } from "../hooks/useListClubs";
import placeholder from "../../../assets/placeholder.png";
import { SearchInput } from "@/components/SearchInput";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/index.tsx";
import type { ClubSummary } from "@/features/profile/dtos";
import {
  myClubSummaries,
  recommendedClubSummaries,
} from "@/mocks/clubsSummary";
import { useNavigate } from "react-router-dom";

export default function ListClubs() {
  const { data: future, isLoading, error } = useListClubs();
  const navigate = useNavigate();

  let content;

  if (isLoading) {
    content = <div className="text-center py-8">Carregando clubes...</div>;
  }

  if (error) {
    content = (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Erro ao carregar clubes</p>
        </div>
      </div>
    );
  }

  if (myClubSummaries && myClubSummaries.length === 0) {
    content = (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Nenhum clube encontrado</p>
          <p className="text-gray-600">
            Tente ajustar os filtros ou criar um novo clube.
          </p>
        </div>
      </div>
    );
  }

  if (myClubSummaries && myClubSummaries.length > 0) {
    content = (
      <div className="flex flex-col">
        <p className="font-medium mb-6">Clubes perto de você</p>

        {myClubSummaries?.map((club: ClubSummary) => (
          <>
            <ItemClub key={club.id} club={club} />
            <Separator className="my-4" />
          </>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="flex text-sm font-medium items-center justify-center">
        <MapPin className="inline-block mr-1 text-gray-500" size={16} />
        Rio de Janeiro, RJ
      </p>

      <div>
        <SearchInput
          value={""}
          onChange={function (value: string): void {
            throw new Error("Function not implemented.");
          }}
          placeholder="Buscar clubes"
        />
      </div>

      <div>
        <p className="font-medium mb-2">Clubes indicados pra você</p>
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {recommendedClubSummaries.map((club: ClubSummary) => (
              <CarouselItem
                key={club.id}
                className="pl-2 basis-[256px]"
                onClick={() => navigate(`/clubes/${club.id}`)}
              >
                <div className="rounded-xl border flex flex-col  p-2 gap-2">
                  <img
                    src={placeholder}
                    alt="Logo"
                    className="h-40 w-60 border-2 rounded-md"
                  />

                  <p className="text-sm font-medium">{club.nome}</p>
                  <p className="flex text-sm items-center">
                    <MapPin
                      className="inline-block mr-1 text-gray-500"
                      size={16}
                    />
                    {club.cidade}, {club.estado}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {club.generos.map((genero) => (
                      <span className="px-3 py-1 bg-[#f1f1f1] rounded-sm text-sm">
                        {genero}
                      </span>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      {content}
    </div>
  );
}
