import { MapPin } from "lucide-react";
import ItemClub from "../components/itemClub";
import type { Club } from "../dtos";
import { useListClubs } from "../hooks/useListClubs";
import placeholder from "../../../assets/placeholder.png";
import { SearchInput } from "@/components/SearchInput";

import { recommendedClubs, allClubs as clubs } from "../../../mocks/clubes";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/index.tsx";

export default function ListClubs() {
  const { data: future, isLoading, error } = useListClubs();

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

  if (clubs && clubs.length === 0) {
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

  if (clubs && clubs.length > 0) {
    content = (
      <div className="flex flex-col">
        <p className="font-medium mb-6">Clubes perto de você</p>

        {clubs?.map((club: Club) => (
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
            {recommendedClubs.map((item: Club) => (
              <CarouselItem key={item.id} className="pl-2 basis-[256px]">
                <div className="rounded-xl border-1 flex flex-col  p-2 gap-2">
                  <img
                    src={placeholder}
                    alt="Logo"
                    className="h-40 w-60 border-2 rounded-md"
                  />

                  <p className="text-sm font-medium">{item.nome}</p>
                  <p className="flex text-sm items-center">
                    <MapPin
                      className="inline-block mr-1 text-gray-500"
                      size={16}
                    />
                    {item.cidade_nome}, {item.estado_sigla}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {item.generos.map((genero) => (
                      <span
                        key={genero.id}
                        className="px-3 py-1 bg-[#f1f1f1] rounded-sm text-sm"
                      >
                        {genero.nome}
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
