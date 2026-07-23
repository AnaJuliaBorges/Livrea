import { normalizeText } from "@/lib/text";
import { FILTER_ALL } from "../constants";
import type { ClubListItem, ClubMatchGroup } from "../dtos";

// Filtros da listagem de clubes. Tudo client-side de propósito: a lista
// completa já está carregada e a resposta é instantânea. Se um dia a
// listagem paginar (list_clubs tem p_limit/p_offset), isto precisa migrar
// pros parâmetros da RPC — filtrar só a página carregada esconderia
// resultados silenciosamente.
export type ClubListFilterValues = {
  type: string;
  genre: string;
  privacy: string;
};

export const NO_FILTERS: ClubListFilterValues = {
  type: FILTER_ALL,
  genre: FILTER_ALL,
  privacy: FILTER_ALL,
};

export function matchesSearch(club: ClubListItem, search: string): boolean {
  return normalizeText(club.name).includes(normalizeText(search.trim()));
}

export function matchesFilters(
  club: ClubListItem,
  filters: ClubListFilterValues,
): boolean {
  return (
    (filters.type === FILTER_ALL || club.meetingType === filters.type) &&
    (filters.genre === FILTER_ALL ||
      club.genreIds.includes(Number(filters.genre))) &&
    (filters.privacy === FILTER_ALL ||
      club.isPrivate === (filters.privacy === "privado"))
  );
}

// Indicados: clubes que o usuário não participa, que têm pelo menos um
// gênero em comum com as preferências do perfil e que ele consegue
// frequentar — só da sua cidade (match_group "city") ou online. Presenciais
// de outra cidade/estado ("state"/"other") não entram. Ordenados do maior
// para o menor número de gêneros em comum.
const RECOMMENDABLE_GROUPS: ClubMatchGroup[] = ["city", "online"];

export function rankRecommendedClubs(
  clubs: ClubListItem[],
  preferredGenreIds: number[],
): ClubListItem[] {
  const countMatchingGenres = (club: ClubListItem) =>
    club.genreIds.filter((genreId) => preferredGenreIds.includes(genreId))
      .length;

  return clubs
    .filter(
      (club) =>
        !club.isMember &&
        RECOMMENDABLE_GROUPS.includes(club.matchGroup) &&
        countMatchingGenres(club) > 0,
    )
    .sort((a, b) => countMatchingGenres(b) - countMatchingGenres(a));
}
