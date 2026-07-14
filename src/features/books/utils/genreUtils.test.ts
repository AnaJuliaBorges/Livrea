import { describe, it, expect } from "vitest";
import { getSelectedGenreNames } from "./genreUtils";
import type { Genre } from "../services/getGenres";

const allGenres: Genre[] = [
  { id: 1, name: "Fantasia", google_category: ["Fiction/Fantasy"] },
  { id: 2, name: "Romance", google_category: ["Fiction/Romance"] },
  { id: 3, name: "Sem categoria Google", google_category: null },
  { id: 4, name: "Categoria vazia", google_category: [] },
];

describe("getSelectedGenreNames", () => {
  it("mapeia ids de gênero para a primeira categoria do Google de cada um", () => {
    expect(getSelectedGenreNames([1, 2], allGenres)).toEqual([
      "Fiction/Fantasy",
      "Fiction/Romance",
    ]);
  });

  it("ignora ids que não existem na lista de gêneros", () => {
    expect(getSelectedGenreNames([999], allGenres)).toEqual([]);
  });

  it("ignora gêneros sem google_category", () => {
    expect(getSelectedGenreNames([3], allGenres)).toEqual([]);
  });

  it("ignora gêneros com google_category vazio", () => {
    expect(getSelectedGenreNames([4], allGenres)).toEqual([]);
  });

  it("retorna array vazio quando não há ids selecionados", () => {
    expect(getSelectedGenreNames([], allGenres)).toEqual([]);
  });
});
