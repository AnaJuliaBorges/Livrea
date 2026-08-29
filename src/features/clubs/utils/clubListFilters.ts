import { normalizeText } from "@/lib/text";
import { FILTER_ALL } from "../constants";
import type { ClubListItem, ClubMatchGroup } from "../dtos";

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
