export interface Gender {
  id: number;
  nome: string;
}

export interface Book {
  titulo: string;
  autores: string[];
  capa_url: string | null;
}

export interface Reading {
  id: string;
  status: string;
  livro: Book;
}

export interface Club {
  id: string;
  nome: string;
  descricao: string;
  privacidade: boolean;
  limite_participantes: number | null;
  tipo: string;
  frequencia: string | null;
  leitura_atual: Reading | null;
  generos: Gender[];
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
