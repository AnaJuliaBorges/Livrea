import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

export interface Genero {
  id: number;
  nome: string;
}

export interface Livro {
  titulo: string;
  autores: string[];
  capa_url: string | null;
}

export interface LeituraAtual {
  id: string;
  status: string;
  livro: Livro;
}

export interface Clube {
  id: string;
  nome: string;
  descricao: string;
  privacidade: boolean;
  limite_participantes: number | null;
  tipo: string;
  frequencia: string | null;
  leitura_atual: LeituraAtual | null;
  generos: Genero[];
  cidade_nome: string;
  estado_sigla: string;
  total_participantes: number;
}

export interface FiltrosClubes {
  privacidade?: boolean;
  genero_id?: number;
  estado_id?: number;
  cidade_id?: number;
  pagina?: number;
  por_pagina?: number;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "",
);

export function useListarClubes(privacidade?: boolean) {
  return useQuery<Clube[]>({
    queryKey: ["clubes", privacidade],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_clubs", {
        p_privacidade: privacidade ?? null,
        p_limite: 20,
        p_offset: 0,
      });

      if (error) {
        console.error("Erro ao buscar clubes:", error);
        throw error;
      }

      // Extrair o objeto 'clube' de cada linha
      return (data || []).map((row: any) => row.clube as Clube);
    },
  });
}
