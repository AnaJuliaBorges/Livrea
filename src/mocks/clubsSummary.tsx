import type { ClubSummary } from "@/features/profile/dtos";
import { allClubs, myClubs, recommendedClubs } from "./clubes";

export const recommendedClubSummaries: ClubSummary[] = recommendedClubs.map(
  (club) => ({
    id: club.id,
    name: club.name,
    city: club.cityName,
    state: club.stateAbbreviation,
    coverUrl: null,
    genres: club.genres.map((g) => g.name),
    isAdmin: false,
    participants: club.totalParticipants,
    participantLimit: club.participantLimit,
  }),
);

export const allClubSummaries: ClubSummary[] = allClubs.map((club) => ({
  id: club.id,
  name: club.name,
  city: club.cityName,
  state: club.stateAbbreviation,
  coverUrl: null,
  genres: club.genres.map((g) => g.name),
  isAdmin: false,
  participants: club.totalParticipants,
  participantLimit: club.participantLimit,
}));

export const myClubSummaries: ClubSummary[] = myClubs.map((club, index) => ({
  id: club.id,
  name: club.name,
  city: club.cityName,
  state: club.stateAbbreviation,
  coverUrl: null,
  genres: club.genres.map((g) => g.name),
  isAdmin: index === 0, // primeiro clube é administrado pelo usuário
  participants: club.totalParticipants,
  participantLimit: club.participantLimit,
}));
