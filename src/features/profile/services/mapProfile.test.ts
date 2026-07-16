import { mapProfile, type RawProfile } from "./mapProfile";

function makeRaw(overrides: Partial<RawProfile> = {}): RawProfile {
  return {
    id: "user-1",
    name: "Ana Júlia",
    bio: "leitora",
    avatar_url: "https://cdn/avatar.png",
    city: "Recife",
    state: "PE ",
    state_id: 26,
    city_id: 2611606,
    clubs: [],
    library: { read: [], reading: [], want_to_read: [] },
    ...overrides,
  };
}

const rawBook = {
  id: "book-1",
  title: "Dom Casmurro",
  rating: 5,
  image_thumbnail: "thumb.png",
  image_medium: "medium.png",
  image_large: "large.png",
};

describe("mapProfile", () => {
  it("mapeia os campos snake_case para camelCase", () => {
    const profile = mapProfile(makeRaw());

    expect(profile).toMatchObject({
      id: "user-1",
      name: "Ana Júlia",
      bio: "leitora",
      avatarUrl: "https://cdn/avatar.png",
      city: "Recife",
      stateId: 26,
      cityId: 2611606,
    });
  });

  it("faz trim do estado e trata como null quando ausente", () => {
    expect(mapProfile(makeRaw({ state: "PE " })).state).toBe("PE");
    expect(mapProfile(makeRaw({ state: null })).state).toBeNull();
  });

  it("mapeia os clubes com estado sem espaços e cidade padrão vazia", () => {
    const profile = mapProfile(
      makeRaw({
        clubs: [
          {
            id: "club-1",
            name: "Clube da Ana",
            city: null,
            state: "SP ",
            cover_url: "cover.png",
            genres: ["fantasia"],
            is_admin: true,
            participants: 4,
            participant_limit: null,
          },
        ],
      }),
    );

    expect(profile.clubs[0]).toEqual({
      id: "club-1",
      name: "Clube da Ana",
      city: "",
      state: "SP",
      coverUrl: "cover.png",
      genres: ["fantasia"],
      isAdmin: true,
      participants: 4,
      participantLimit: null,
    });
  });

  it("mapeia os livros das três prateleiras da biblioteca", () => {
    const profile = mapProfile(
      makeRaw({
        library: {
          read: [rawBook],
          reading: [],
          want_to_read: [{ ...rawBook, id: "book-2", rating: null }],
        },
      }),
    );

    expect(profile.library.read[0]).toEqual({
      id: "book-1",
      title: "Dom Casmurro",
      rating: 5,
      imageThumbnail: "thumb.png",
      imageMedium: "medium.png",
      imageLarge: "large.png",
    });
    expect(profile.library.reading).toEqual([]);
    expect(profile.library.wantToRead[0]).toMatchObject({
      id: "book-2",
      rating: null,
    });
  });
});
