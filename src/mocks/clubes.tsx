import type { Club, ClubParticipant } from "@/features/clubs/dtos";

export const recommendedClubs: Club[] = [
  {
    id: "1",
    nome: "Clube Fantasia Viva",
    descricao:
      "Exploramos mundos mágicos, jornadas épicas e universos fantásticos.",
    privacidade: true,
    limite_participantes: 500,
    tipo: "leitura",
    frequencia: "mensal",
    leitura_atual: {
      id: "book-1",
      titulo: "Harry Potter e a Câmara Secreta",
    },
    descricao_encontros:
      "Encontros presenciais toda última quinta-feira do mês às 17h.",
    proximo_encontro: {
      local: "Livraria da Travessa - Botafogo",
      data: "2026-07-30",
      horario: "17:00",
      confirmedMembers: 10,
    },
    generos: [
      { id: 1, nome: "Fantasia" },
      { id: 2, nome: "Aventura" },
    ],
    cidade_nome: "Rio de Janeiro",
    estado_sigla: "RJ",
    total_participantes: 1240,
    regras: [
      "Respeite a opinião dos demais participantes.",
      "Evite spoilers antes da data da discussão.",
      "Mantenha um ambiente acolhedor e respeitoso.",
      "Participe sempre que possível dos encontros.",
    ],

    historico_leituras: [
      {
        id: "book-2",
        capa: null,
      },
      {
        id: "book-4",
        capa: null,
      },
    ],
  },
  {
    id: "2",
    nome: "Clube Mistério Urbano",
    descricao:
      "Suspense, thrillers e histórias que te prendem até a última página.",
    privacidade: false,
    limite_participantes: 300,
    tipo: "leitura",
    frequencia: "quinzenal",
    leitura_atual: {
      id: "book-7",
      titulo: "O Código Da Vinci",
    },
    descricao_encontros:
      "Encontros online quinzenais às quartas-feiras às 20h.",
    proximo_encontro: {
      local: "Google Meet",
      data: "2026-07-22",
      horario: "20:00",
      confirmedMembers: 250,
    },
    generos: [
      { id: 3, nome: "Mistério" },
      { id: 4, nome: "Suspense" },
    ],
    cidade_nome: "São Paulo",
    estado_sigla: "SP",
    total_participantes: 890,
    regras: [
      "Respeite a opinião dos demais participantes.",
      "Evite spoilers antes da data da discussão.",
      "Use a marcação de spoiler no chat.",
      "Mantenha as discussões focadas no livro.",
    ],

    historico_leituras: [
      {
        id: "book-6",
        capa: null,
      },
    ],
  },
  {
    id: "3",
    nome: "Clube Romance Contemporâneo",
    descricao: "Histórias de amor modernas, reais e cheias de emoção.",
    privacidade: false,
    limite_participantes: null,
    tipo: "leitura",
    frequencia: "mensal",
    leitura_atual: {
      id: "book-5",
      titulo: "Orgulho e Preconceito",
    },
    descricao_encontros:
      "Encontros presenciais no primeiro sábado do mês às 15h.",
    proximo_encontro: {
      local: "Café com Letras",
      data: "2026-08-01",
      horario: "15:00",
      confirmedMembers: 10,
    },
    generos: [{ id: 5, nome: "Romance" }],
    cidade_nome: "Belo Horizonte",
    estado_sigla: "MG",
    total_participantes: 1520,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],

    historico_leituras: [
      {
        id: "book-10",
        capa: null,
      },
    ],
  },
];

export const allClubs: Club[] = [
  ...recommendedClubs,

  {
    id: "4",
    nome: "Clube Sci-Fi Orbit",
    descricao: "Exploração espacial, tecnologia e futuros possíveis.",
    privacidade: true,
    limite_participantes: 800,
    tipo: "leitura",
    frequencia: "mensal",
    leitura_atual: {
      id: "book-3",
      titulo: "Duna",
    },
    descricao_encontros: "Encontros online todas as segundas-feiras às 20h.",
    proximo_encontro: {
      local: "Servidor Discord",
      data: "2026-07-13",
      horario: "20:00",
      confirmedMembers: 300,
    },
    generos: [{ id: 6, nome: "Ficção Científica" }],
    cidade_nome: "Curitiba",
    estado_sigla: "PR",
    total_participantes: 980,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    historico_leituras: [
      {
        id: "book-11",
        capa: null,
      },
    ],
  },
  {
    id: "5",
    nome: "Clube Poesia Viva",
    descricao: "Poemas clássicos e contemporâneos que tocam a alma.",
    privacidade: false,
    limite_participantes: 200,
    tipo: "leitura",
    frequencia: "semanal",
    leitura_atual: {
      id: "book-9",
      titulo: "Antologia Poética",
    },
    descricao_encontros: "Rodas de leitura todos os domingos às 10h.",
    proximo_encontro: {
      local: "Parque Farroupilha",
      data: "2026-07-12",
      horario: "10:00",
      confirmedMembers: 25,
    },
    generos: [{ id: 7, nome: "Poesia" }],
    cidade_nome: "Porto Alegre",
    estado_sigla: "RS",
    total_participantes: 430,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    historico_leituras: [
      {
        id: "book-12",
        capa: null,
      },
    ],
  },
  {
    id: "6",
    nome: "Clube Clássicos Brasileiros",
    descricao: "Literatura brasileira em sua forma mais rica e histórica.",
    privacidade: false,
    limite_participantes: null,
    tipo: "leitura",
    frequencia: "mensal",
    leitura_atual: {
      id: "book-8",
      titulo: "A Hora da Estrela",
    },
    descricao_encontros:
      "Encontros presenciais na segunda terça-feira do mês às 19h.",
    proximo_encontro: {
      local: "Biblioteca Pública da Bahia",
      data: "2026-07-14",
      horario: "19:00",
      confirmedMembers: 1000,
    },
    generos: [
      { id: 8, nome: "Clássicos" },
      { id: 9, nome: "Literatura" },
    ],
    cidade_nome: "Salvador",
    estado_sigla: "BA",
    total_participantes: 670,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    historico_leituras: [
      {
        id: "book-13",
        capa: null,
      },
    ],
  },
  {
    id: "7",
    nome: "Clube Horror & Sombras",
    descricao: "Histórias sombrias, terror psicológico e suspense intenso.",
    privacidade: true,
    limite_participantes: 400,
    tipo: "leitura",
    frequencia: "mensal",
    leitura_atual: {
      id: "book-6",
      titulo: "Drácula",
    },
    descricao_encontros:
      "Encontros presenciais na última sexta-feira do mês às 21h.",
    proximo_encontro: {
      local: "Café Sombrio",
      data: "2026-07-31",
      horario: "21:00",
      confirmedMembers: 40,
    },
    generos: [{ id: 10, nome: "Terror" }],
    cidade_nome: "Recife",
    estado_sigla: "PE",
    total_participantes: 760,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    historico_leituras: [
      {
        id: "book-13",
        capa: null,
      },
    ],
  },
];

export const myClubs: Club[] = [
  {
    id: "1",
    nome: "Clube Fantasia Viva",
    descricao:
      "Exploramos mundos mágicos, jornadas épicas e universos fantásticos.",
    privacidade: true,
    limite_participantes: 500,
    tipo: "leitura",
    frequencia: "mensal",
    leitura_atual: {
      id: "book-1",
      titulo: "Harry Potter e a Câmara Secreta",
    },
    descricao_encontros:
      "Encontros presenciais toda última quinta-feira do mês às 17h.",
    proximo_encontro: {
      local: "Livraria da Travessa - Botafogo",
      data: "2026-07-30",
      horario: "17:00",
      confirmedMembers: 50,
    },
    generos: [
      { id: 1, nome: "Fantasia" },
      { id: 2, nome: "Aventura" },
    ],
    cidade_nome: "Rio de Janeiro",
    estado_sigla: "RJ",
    total_participantes: 1240,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    historico_leituras: [
      {
        id: "book-13",
        capa: null,
      },
    ],
  },

  {
    id: "2",
    nome: "Clube Mistério Urbano",
    descricao:
      "Suspense, thrillers e histórias que te prendem até a última página.",
    privacidade: false,
    limite_participantes: 300,
    tipo: "leitura",
    frequencia: "quinzenal",
    leitura_atual: {
      id: "book-7",
      titulo: "O Código Da Vinci",
    },
    descricao_encontros:
      "Encontros online quinzenais às quartas-feiras às 20h.",
    proximo_encontro: {
      local: "Google Meet",
      data: "2026-07-22",
      horario: "20:00",
      confirmedMembers: 30,
    },
    generos: [
      { id: 3, nome: "Mistério" },
      { id: 4, nome: "Suspense" },
    ],
    cidade_nome: "São Paulo",
    estado_sigla: "SP",
    total_participantes: 890,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    historico_leituras: [
      {
        id: "book-13",
        capa: null,
      },
    ],
  },
  {
    id: "3",
    nome: "Clube Romance Contemporâneo",
    descricao: "Histórias de amor modernas, reais e cheias de emoção.",
    privacidade: false,
    limite_participantes: null,
    tipo: "leitura",
    frequencia: "mensal",
    leitura_atual: {
      id: "book-5",
      titulo: "Orgulho e Preconceito",
    },
    descricao_encontros:
      "Encontros presenciais no primeiro sábado do mês às 15h.",
    proximo_encontro: {
      local: "Café com Letras",
      data: "2026-08-01",
      horario: "15:00",
      confirmedMembers: 8,
    },
    generos: [{ id: 5, nome: "Romance" }],
    cidade_nome: "Belo Horizonte",
    estado_sigla: "MG",
    total_participantes: 1520,
    regras: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    historico_leituras: [
      {
        id: "book-13",
        capa: null,
      },
    ],
  },
];

export const mockClubParticipants: ClubParticipant[] = [
  {
    id: "user-1",
    nome: "Ana Júlia Borges",
    foto: null,
    entrou_em: "2026-01-18",
  },
  {
    id: "user-2",
    nome: "Lucas Martins",
    foto: null,
    entrou_em: "2026-01-23",
  },
  {
    id: "user-3",
    nome: "Mariana Costa",
    foto: null,
    entrou_em: "2026-02-05",
  },
  {
    id: "user-4",
    nome: "Pedro Henrique",
    foto: null,
    entrou_em: "2026-02-14",
  },
  {
    id: "user-5",
    nome: "Beatriz Almeida",
    foto: null,
    entrou_em: "2026-03-02",
  },
  {
    id: "user-6",
    nome: "Gabriel Oliveira",
    foto: null,
    entrou_em: "2026-03-19",
  },
  {
    id: "user-7",
    nome: "Camila Rocha",
    foto: null,
    entrou_em: "2026-04-08",
  },
  {
    id: "user-8",
    nome: "João Vitor",
    foto: null,
    entrou_em: "2026-04-21",
  },
  {
    id: "user-9",
    nome: "Fernanda Lima",
    foto: null,
    entrou_em: "2026-05-12",
  },
  {
    id: "user-10",
    nome: "Rafael Souza",
    foto: null,
    entrou_em: "2026-06-01",
  },
];

export interface ClubInteractions {
  destaques: ClubHighlight[];
  avaliacoes: ClubReview[];
  progresso_participantes: ClubParticipantProgress[];
}

export interface ClubHighlight {
  id: string;
  texto: string;
  pagina: number;
  total_marcacoes: number;
}

export interface ClubReview {
  id: string;
  usuario: {
    id: string;
    nome: string;
    foto: string | null;
  };
  nota: number;
  resenha: string;
}

export interface ClubParticipantProgress {
  usuario: {
    id: string;
    nome: string;
    foto: string | null;
  };
  entrou_em: string;
  administrador: boolean;
  progresso: number;
  nota: number | null;
}

export const mockClubInteractions: ClubInteractions = {
  destaques: [
    {
      id: "highlight-1",
      texto:
        "São as nossas escolhas que revelam o que realmente somos, muito mais do que as nossas qualidades.",
      pagina: 215,
      total_marcacoes: 42,
    },
    {
      id: "highlight-2",
      texto: "O medo de um nome aumenta o medo da própria coisa.",
      pagina: 101,
      total_marcacoes: 37,
    },
    {
      id: "highlight-3",
      texto:
        "A felicidade pode ser encontrada até mesmo nas horas mais sombrias.",
      pagina: 184,
      total_marcacoes: 58,
    },
    {
      id: "highlight-4",
      texto: "Não vale a pena mergulhar nos sonhos e esquecer de viver.",
      pagina: 287,
      total_marcacoes: 31,
    },
  ],

  avaliacoes: [
    {
      id: "review-1",
      usuario: {
        id: "user-1",
        nome: "Ana Júlia Borges",
        foto: null,
      },
      nota: 5,
      resenha:
        "Uma releitura incrível. A construção do mistério continua me prendendo do início ao fim.",
    },
    {
      id: "review-2",
      usuario: {
        id: "user-2",
        nome: "Lucas Martins",
        foto: null,
      },
      nota: 4,
      resenha:
        "Gostei bastante da evolução dos personagens. O final continua excelente.",
    },
    {
      id: "review-3",
      usuario: {
        id: "user-3",
        nome: "Mariana Costa",
        foto: null,
      },
      nota: 5,
      resenha:
        "Foi meu livro favorito da série até agora. O clima de suspense é muito bom.",
    },
    {
      id: "review-4",
      usuario: {
        id: "user-4",
        nome: "Pedro Henrique",
        foto: null,
      },
      nota: 4,
      resenha:
        "Achei o começo um pouco lento, mas depois a leitura fluiu muito.",
    },
  ],

  progresso_participantes: [
    {
      usuario: {
        id: "user-1",
        nome: "Ana Júlia Borges",
        foto: null,
      },
      entrou_em: "2026-01-18",
      administrador: true,
      progresso: 100,
      nota: 5,
    },
    {
      usuario: {
        id: "user-2",
        nome: "Lucas Martins",
        foto: null,
      },
      entrou_em: "2026-01-23",
      administrador: false,
      progresso: 100,
      nota: 4,
    },
    {
      usuario: {
        id: "user-3",
        nome: "Mariana Costa",
        foto: null,
      },
      entrou_em: "2026-02-05",
      administrador: false,
      progresso: 82,
      nota: null,
    },
    {
      usuario: {
        id: "user-4",
        nome: "Pedro Henrique",
        foto: null,
      },
      entrou_em: "2026-02-14",
      administrador: false,
      progresso: 68,
      nota: null,
    },
    {
      usuario: {
        id: "user-5",
        nome: "Beatriz Almeida",
        foto: null,
      },
      entrou_em: "2026-03-02",
      administrador: false,
      progresso: 43,
      nota: null,
    },
    {
      usuario: {
        id: "user-6",
        nome: "Gabriel Oliveira",
        foto: null,
      },
      entrou_em: "2026-03-19",
      administrador: false,
      progresso: 21,
      nota: null,
    },
    {
      usuario: {
        id: "user-7",
        nome: "Camila Rocha",
        foto: null,
      },
      entrou_em: "2026-04-08",
      administrador: false,
      progresso: 100,
      nota: 5,
    },
    {
      usuario: {
        id: "user-8",
        nome: "João Vitor",
        foto: null,
      },
      entrou_em: "2026-04-21",
      administrador: false,
      progresso: 100,
      nota: 4,
    },
  ],
};
