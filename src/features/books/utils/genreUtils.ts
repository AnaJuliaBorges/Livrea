import type { Genre } from "../services/getGenres";

export function getSelectedGenreNames(
  genreIds: number[],
  allGenres: Genre[],
): string[] {
  return genreIds
    .map(
      (genreId) =>
        allGenres.find((g) => g.id === genreId)?.google_category?.[0],
    )
    .filter((category) => category !== undefined) as string[];
}
