import type { UserBook, UserProfile } from "../dtos";

type RawBook = {
  id: string;
  title: string;
  rating: number | null;
  image_thumbnail: string | null;
  image_medium: string | null;
  image_large: string | null;
};

type RawClub = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  cover_url: string | null;
  genres: string[];
  is_admin: boolean;
  participants: number;
  participant_limit: number | null;
};

export type RawProfile = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  state_id: number | null;
  city_id: number | null;
  clubs: RawClub[];
  library: {
    read: RawBook[];
    reading: RawBook[];
    want_to_read: RawBook[];
  };
};

function mapBook(raw: RawBook): UserBook {
  return {
    id: raw.id,
    title: raw.title,
    rating: raw.rating,
    imageThumbnail: raw.image_thumbnail,
    imageMedium: raw.image_medium,
    imageLarge: raw.image_large,
  };
}

export function mapProfile(raw: RawProfile): UserProfile {
  return {
    id: raw.id,
    name: raw.name,
    bio: raw.bio,
    avatarUrl: raw.avatar_url,
    city: raw.city,
    state: raw.state?.trim() ?? null,
    stateId: raw.state_id,
    cityId: raw.city_id,
    clubs: raw.clubs.map((club) => ({
      id: club.id,
      name: club.name,
      city: club.city ?? "",
      state: club.state?.trim() ?? "",
      coverUrl: club.cover_url,
      genres: club.genres,
      isAdmin: club.is_admin,
      participants: club.participants,
      participantLimit: club.participant_limit,
    })),
    library: {
      read: raw.library.read.map(mapBook),
      reading: raw.library.reading.map(mapBook),
      wantToRead: raw.library.want_to_read.map(mapBook),
    },
  };
}
