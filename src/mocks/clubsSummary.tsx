import type { ClubSummary } from "@/features/profile/dtos";
import { allClubs, myClubs, recommendedClubs } from "./clubes";

export const recommendedClubSummaries: ClubSummary[] = recommendedClubs.map(
  (club) => ({
    id: club.id,
    nome: club.nome,
    cidade: club.cidade_nome,
    estado: club.estado_sigla,
    generos: club.generos.map((g) => g.nome),
    administrador: false,
    participantes: club.total_participantes,
    limite_participantes: club.limite_participantes,
  }),
);

export const allClubSummaries: ClubSummary[] = allClubs.map((club) => ({
  id: club.id,
  nome: club.nome,
  cidade: club.cidade_nome,
  estado: club.estado_sigla,
  generos: club.generos.map((g) => g.nome),
  administrador: false,
  participantes: club.total_participantes,
  limite_participantes: club.limite_participantes,
}));

export const myClubSummaries: ClubSummary[] = myClubs.map((club, index) => ({
  id: club.id,
  nome: club.nome,
  cidade: club.cidade_nome,
  estado: club.estado_sigla,
  generos: club.generos.map((g) => g.nome),
  administrador: index === 0, // primeiro clube é administrado pelo usuário
  participantes: club.total_participantes,
  limite_participantes: club.limite_participantes,
}));
