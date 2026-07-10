import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { Club } from "../dtos";

type RawClub = {
  id: string;
  nome: string;
  descricao: string;
  privacidade: boolean;
  limite_participantes: number | null;
  tipo: string;
  frequencia: string | null;
  leitura_atual: { id: string; titulo: string } | null;
  generos: { id: number; nome: string }[];
  cidade_nome: string;
  estado_sigla: string;
  total_participantes: number;
  descricao_encontros: string;
  proximo_encontro: {
    local: string;
    data: string;
    horario: string;
    confirmedMembers: number;
  } | null;
  regras: string[];
  historico_leituras: { id: string; capa: string | null }[];
};

function mapClub(raw: RawClub): Club {
  return {
    id: raw.id,
    name: raw.nome,
    description: raw.descricao,
    isPrivate: raw.privacidade,
    participantLimit: raw.limite_participantes,
    type: raw.tipo,
    frequency: raw.frequencia,
    currentReading: raw.leitura_atual
      ? { id: raw.leitura_atual.id, title: raw.leitura_atual.titulo }
      : null,
    genres: raw.generos.map((genre) => ({ id: genre.id, name: genre.nome })),
    cityName: raw.cidade_nome,
    stateAbbreviation: raw.estado_sigla,
    totalParticipants: raw.total_participantes,
    meetingDescription: raw.descricao_encontros,
    nextMeeting: raw.proximo_encontro
      ? {
          location: raw.proximo_encontro.local,
          date: raw.proximo_encontro.data,
          time: raw.proximo_encontro.horario,
          confirmedMembers: raw.proximo_encontro.confirmedMembers,
        }
      : null,
    rules: raw.regras,
    readingHistory: raw.historico_leituras.map((book) => ({
      id: book.id,
      cover: book.capa,
    })),
  };
}

export function useListClubs(isPrivate?: boolean) {
  return useQuery<Club[]>({
    queryKey: ["clubs", isPrivate],
    queryFn: async () => {
      // p_privacidade/p_limite/p_offset are the list_clubs RPC's own parameter names
      const { data, error } = await supabase.rpc("list_clubs", {
        p_privacidade: isPrivate ?? null,
        p_limite: 20,
        p_offset: 0,
      });

      if (error) {
        console.error("Error fetching clubs:", error);
        throw error;
      }

      return (data ?? []).map((row: { clube: RawClub }) => mapClub(row.clube));
    },
  });
}
