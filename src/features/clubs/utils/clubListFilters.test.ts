import type { ClubListItem } from "../dtos";
import {
  matchesFilters,
  matchesSearch,
  NO_FILTERS,
  rankRecommendedClubs,
} from "./clubListFilters";

function clubItem(overrides: Partial<ClubListItem> = {}): ClubListItem {
  return {
    id: "club-1",
    name: "Clube X",
    description: "",
    coverUrl: null,
    isPrivate: false,
    city: "Campinas",
    state: "SP",
    genres: ["Fantasia"],
    isAdmin: false,
    isMember: false,
    participants: 5,
    participantLimit: null,
    matchGroup: "other",
    meetingType: "in_person",
    genreIds: [1],
    ...overrides,
  };
}

describe("matchesSearch", () => {
  it("ignora acentos e caixa nos dois lados", () => {
    const club = clubItem({ name: "Clube da Fantásia Épica" });

    expect(matchesSearch(club, "fantasia")).toBe(true);
    expect(matchesSearch(club, "ÉPICA")).toBe(true);
    expect(matchesSearch(clubItem({ name: "Poesia" }), "poesía")).toBe(true);
  });

  it("não casa prefixo inexistente e aceita busca vazia", () => {
    const club = clubItem({ name: "Clube X" });

    expect(matchesSearch(club, "inexistente")).toBe(false);
    expect(matchesSearch(club, "")).toBe(true);
    expect(matchesSearch(club, "   ")).toBe(true);
  });
});

describe("matchesFilters", () => {
  const club = clubItem({
    meetingType: "online",
    genreIds: [1, 3],
    isPrivate: true,
  });

  it("sem filtros ativos, tudo passa", () => {
    expect(matchesFilters(club, NO_FILTERS)).toBe(true);
  });

  it("filtra por tipo de encontro", () => {
    expect(matchesFilters(club, { ...NO_FILTERS, type: "online" })).toBe(true);
    expect(matchesFilters(club, { ...NO_FILTERS, type: "in_person" })).toBe(
      false,
    );
  });

  it("filtra por gênero (id numérico vindo como string)", () => {
    expect(matchesFilters(club, { ...NO_FILTERS, genre: "3" })).toBe(true);
    expect(matchesFilters(club, { ...NO_FILTERS, genre: "2" })).toBe(false);
  });

  it("filtra por privacidade", () => {
    expect(matchesFilters(club, { ...NO_FILTERS, privacy: "privado" })).toBe(
      true,
    );
    expect(matchesFilters(club, { ...NO_FILTERS, privacy: "publico" })).toBe(
      false,
    );
    expect(
      matchesFilters(clubItem({ isPrivate: false }), {
        ...NO_FILTERS,
        privacy: "publico",
      }),
    ).toBe(true);
  });

  it("combina os três filtros com E lógico", () => {
    expect(
      matchesFilters(club, { type: "online", genre: "1", privacy: "privado" }),
    ).toBe(true);
    expect(
      matchesFilters(club, { type: "online", genre: "2", privacy: "privado" }),
    ).toBe(false);
  });
});

describe("rankRecommendedClubs", () => {
  it("exclui clubes em que já sou membro e sem gênero em comum", () => {
    const clubs = [
      clubItem({ id: "meu", matchGroup: "city", isMember: true, genreIds: [1] }),
      clubItem({ id: "sem-match", matchGroup: "city", genreIds: [9] }),
      clubItem({ id: "com-match", matchGroup: "city", genreIds: [1] }),
    ];

    const ranked = rankRecommendedClubs(clubs, [1, 2]);

    expect(ranked.map((club) => club.id)).toEqual(["com-match"]);
  });

  it("só indica clubes da cidade ou online, nunca de outro estado", () => {
    const clubs = [
      clubItem({ id: "cidade", matchGroup: "city", genreIds: [1] }),
      clubItem({ id: "online", matchGroup: "online", genreIds: [1] }),
      clubItem({ id: "estado", matchGroup: "state", genreIds: [1] }),
      clubItem({ id: "outro", matchGroup: "other", genreIds: [1] }),
    ];

    const ranked = rankRecommendedClubs(clubs, [1]);

    expect(ranked.map((club) => club.id)).toEqual(["cidade", "online"]);
  });

  it("ordena do maior para o menor número de gêneros em comum", () => {
    const clubs = [
      clubItem({ id: "um", matchGroup: "city", genreIds: [1] }),
      clubItem({ id: "dois", matchGroup: "city", genreIds: [1, 2] }),
    ];

    const ranked = rankRecommendedClubs(clubs, [1, 2]);

    expect(ranked.map((club) => club.id)).toEqual(["dois", "um"]);
  });

  it("sem preferências, nada é indicado", () => {
    expect(rankRecommendedClubs([clubItem({ matchGroup: "city" })], [])).toEqual(
      [],
    );
  });
});
