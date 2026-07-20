import { useState } from "react";
import { MapPin } from "lucide-react";
import ItemClub from "../components/ItemClub";
import { RecommendedClubCard } from "../components/RecommendedClubCard";
import { ClubListFilters } from "../components/ClubListFilters";
import { useListClubs } from "../hooks/useListClubs";
import { useGenres } from "@/features/books/hooks/useGenres";
import { useMyProfile } from "@/features/profile/hooks/useMyProfile";
import { useProfileGenreIds } from "@/features/profile/hooks/useProfileGenreIds";
import { SearchInput } from "@/components/SearchInput";
import {
  matchesFilters,
  matchesSearch,
  NO_FILTERS,
  rankRecommendedClubs,
} from "../utils/clubListFilters";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/index.tsx";
import type { ClubListItem, ClubMatchGroup } from "../dtos";

const sectionLabels: Record<ClubMatchGroup, string> = {
  city: "Na sua cidade",
  state: "No seu estado",
  online: "Clubes online",
  other: "Outros clubes",
};

const sectionOrder: ClubMatchGroup[] = ["city", "state", "online", "other"];

export default function ListClubs() {
  const { data: profile } = useMyProfile();
  const {
    data: clubs,
    isLoading,
    error,
  } = useListClubs({
    cityId: profile?.cityId,
    stateId: profile?.stateId,
  });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);

  const { data: preferredGenreIds } = useProfileGenreIds();
  const { data: genres } = useGenres();

  const isSearching = search.trim() !== "";

  const filteredClubs = (clubs ?? []).filter(
    (club) => matchesSearch(club, search) && matchesFilters(club, filters),
  );

  const recommendedClubs = rankRecommendedClubs(
    clubs ?? [],
    preferredGenreIds ?? [],
  );

  const locationLabel =
    profile?.city && profile?.state
      ? `${profile.city}, ${profile.state}`
      : "Defina sua localização no perfil";

  let content;

  if (isLoading) {
    content = <div className="text-center py-8">Carregando clubes...</div>;
  } else if (error) {
    content = (
      <div className="text-center py-8">
        <p className="text-red-600">❌ Erro ao carregar clubes</p>
      </div>
    );
  } else if (filteredClubs.length === 0) {
    content = (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">❌ Nenhum clube encontrado</p>
        <p className="text-gray-600">
          Tente ajustar a busca ou os filtros, ou crie um novo clube.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col">
        {sectionOrder.map((group) => {
          const clubsInGroup = filteredClubs.filter(
            (club) => club.matchGroup === group,
          );

          if (clubsInGroup.length === 0) return null;

          return (
            <div key={group} className="mb-6">
              <p className="font-medium mb-4">{sectionLabels[group]}</p>

              <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                {clubsInGroup.map((club: ClubListItem) => (
                  <div key={club.id}>
                    <ItemClub club={club} />
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      <p className="flex text-sm font-medium items-center justify-center">
        <MapPin className="inline-block mr-1 text-gray-500" size={16} />
        {locationLabel}
      </p>

      <div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar clubes"
        />
      </div>

      {!isSearching && recommendedClubs.length > 0 && (
        <div>
          <p className="font-medium mb-2">Clubes indicados pra você</p>
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {recommendedClubs.map((club: ClubListItem) => (
                <CarouselItem key={club.id} className="pl-2 basis-[256px]">
                  <RecommendedClubCard club={club} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      <ClubListFilters values={filters} onChange={setFilters} genres={genres} />

      {content}
    </div>
  );
}
