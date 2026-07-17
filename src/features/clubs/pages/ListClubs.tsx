import { Fragment, useState } from "react";
import { MapPin } from "lucide-react";
import ItemClub from "../components/ItemClub";
import { MeetingTypeTag } from "../components/MeetingTypeTag";
import { useListClubs } from "../hooks/useListClubs";
import { useMyProfile } from "@/features/profile/hooks/useMyProfile";
import { useProfileGenreIds } from "@/features/profile/hooks/useProfileGenreIds";
import placeholder from "../../../assets/placeholder.png";
import { SearchInput } from "@/components/SearchInput";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/index.tsx";
import type { ClubListItem, ClubMatchGroup } from "../dtos";
import { useNavigate } from "react-router-dom";

const sectionLabels: Record<ClubMatchGroup, string> = {
  city: "Na sua cidade",
  state: "No seu estado",
  online: "Clubes online",
  other: "Outros clubes",
};

const sectionOrder: ClubMatchGroup[] = ["city", "state", "online", "other"];

// máximo de tags de gênero no card de clube indicado; o resto vira "+N"
const MAX_GENRE_TAGS = 3;

// busca ignora acentos e caixa ("poesía" acha "Poesia" e vice-versa)
const normalizeSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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
  const navigate = useNavigate();

  const { data: preferredGenreIds } = useProfileGenreIds();

  const isSearching = search.trim() !== "";

  const filteredClubs = (clubs ?? []).filter((club) =>
    normalizeSearch(club.name).includes(normalizeSearch(search.trim())),
  );

  // Indicados: clubes que o usuário não participa e que têm pelo menos um
  // gênero em comum com as preferências do perfil (profile_genres), ordenados
  // do maior para o menor número de gêneros em comum
  const countMatchingGenres = (club: ClubListItem) =>
    club.genreIds.filter((genreId) => preferredGenreIds?.includes(genreId))
      .length;

  const recommendedClubs = (clubs ?? [])
    .filter((club) => !club.isMember && countMatchingGenres(club) > 0)
    .sort((a, b) => countMatchingGenres(b) - countMatchingGenres(a));

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
          Tente ajustar a busca ou criar um novo clube.
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

              {clubsInGroup.map((club: ClubListItem) => (
                <Fragment key={club.id}>
                  <ItemClub club={club} />
                  <Separator className="my-4" />
                </Fragment>
              ))}
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
                <CarouselItem
                  key={club.id}
                  className="pl-2 basis-[256px]"
                  onClick={() => navigate(`/clubes/${club.id}`)}
                >
                  <div className="rounded-xl border flex flex-col  p-2 gap-2">
                    <img
                      src={club.coverUrl ?? placeholder}
                      alt={club.name}
                      className="h-40 w-60 border-2 rounded-md object-cover"
                    />

                    <p className="text-sm font-medium">{club.name}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {club.city && club.state && (
                        <p className="flex text-sm items-center">
                          <MapPin
                            className="inline-block mr-1 text-gray-500"
                            size={16}
                          />
                          {club.city}, {club.state}
                        </p>
                      )}
                      <MeetingTypeTag type={club.meetingType} variant="soft" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {club.genres.slice(0, MAX_GENRE_TAGS).map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 bg-[#f1f1f1] rounded-sm text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                      {club.genres.length > MAX_GENRE_TAGS && (
                        <span
                          className="px-3 py-1 bg-[#f1f1f1] rounded-sm text-sm text-muted-foreground"
                          title={club.genres.slice(MAX_GENRE_TAGS).join(", ")}
                        >
                          +{club.genres.length - MAX_GENRE_TAGS}
                        </span>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}
      {content}
    </div>
  );
}
