export interface Genre {
  id: number;
  name: string;
}

export interface Book {
  title: string;
  authors: string[];
  coverUrl: string | null;
}

export interface Reading {
  id: string;
  title: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  participantLimit: number | null;
  type: string;
  frequency: string | null;
  currentReading: Reading | null;
  genres: Genre[];
  cityName: string;
  stateAbbreviation: string;
  totalParticipants: number;
  meetingDescription: string;
  nextMeeting: {
    location: string;
    date: string;
    time: string;
    confirmedMembers: number;
  } | null;
  rules: string[];

  readingHistory: {
    id: string;
    cover: string | null;
  }[];
}

export type ClubMatchGroup = "city" | "state" | "online" | "other";

// Item retornado pela RPC list_clubs. Estruturalmente compatível com o
// ClubSummary do perfil, que o ItemClub consome.
export interface ClubListItem {
  id: string;
  name: string;
  description: string;
  coverUrl: string | null;
  isPrivate: boolean;
  city: string;
  state: string;
  genres: string[];
  isAdmin: boolean;
  isMember: boolean;
  participants: number;
  participantLimit: number | null;
  matchGroup: ClubMatchGroup;
}

export interface ClubFilters {
  isPrivate?: boolean;
  genreId?: number;
  stateId?: number;
  cityId?: number;
  page?: number;
  perPage?: number;
}

export interface ClubParticipant {
  id: string;
  name: string;
  photo: string | null;
  joinedAt: string;
}
