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

export interface ReadingHistoryBook {
  id: string;
  title: string;
  imageThumbnail: string | null;
  imageMedium: string | null;
  imageLarge: string | null;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  coverUrl: string | null;
  isPrivate: boolean;
  isMember: boolean;
  isAdmin: boolean;
  hasPendingRequest: boolean;
  participantLimit: number | null;
  type: string;
  frequency: string | null;
  customFrequency: string | null;
  currentReading: Reading | null;
  genres: Genre[];
  cityId: number | null;
  stateId: number | null;
  cityName: string;
  stateAbbreviation: string;
  totalParticipants: number;
  meetingDescription: string;
  nextMeeting: {
    id: string;
    location: string;
    date: string;
    time: string;
    confirmedMembers: number;
    isConfirmedByMe: boolean;
  } | null;
  rules: string;

  readingHistory: ReadingHistoryBook[];
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
  meetingType: string;
  genreIds: number[];
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

export interface ClubMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface MeetingAttendanceMember extends ClubMember {
  confirmed: boolean;
}

export interface ClubJoinRequest {
  requestId: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
}
