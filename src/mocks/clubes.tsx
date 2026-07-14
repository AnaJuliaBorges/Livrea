import type { ClubParticipant } from "@/features/clubs/dtos";

export const mockClubParticipants: ClubParticipant[] = [
  {
    id: "user-1",
    name: "Ana Júlia Borges",
    photo: null,
    joinedAt: "2026-01-18",
  },
  {
    id: "user-2",
    name: "Lucas Martins",
    photo: null,
    joinedAt: "2026-01-23",
  },
  {
    id: "user-3",
    name: "Mariana Costa",
    photo: null,
    joinedAt: "2026-02-05",
  },
  {
    id: "user-4",
    name: "Pedro Henrique",
    photo: null,
    joinedAt: "2026-02-14",
  },
  {
    id: "user-5",
    name: "Beatriz Almeida",
    photo: null,
    joinedAt: "2026-03-02",
  },
  {
    id: "user-6",
    name: "Gabriel Oliveira",
    photo: null,
    joinedAt: "2026-03-19",
  },
  {
    id: "user-7",
    name: "Camila Rocha",
    photo: null,
    joinedAt: "2026-04-08",
  },
  {
    id: "user-8",
    name: "João Vitor",
    photo: null,
    joinedAt: "2026-04-21",
  },
  {
    id: "user-9",
    name: "Fernanda Lima",
    photo: null,
    joinedAt: "2026-05-12",
  },
  {
    id: "user-10",
    name: "Rafael Souza",
    photo: null,
    joinedAt: "2026-06-01",
  },
];

export interface ClubInteractions {
  highlights: ClubHighlight[];
  reviews: ClubReview[];
  participantsProgress: ClubParticipantProgress[];
}

export interface ClubHighlight {
  id: string;
  text: string;
  page: number;
  highlightCount: number;
}

export interface ClubReview {
  id: string;
  user: {
    id: string;
    name: string;
    photo: string | null;
  };
  rating: number;
  review: string;
}

export interface ClubParticipantProgress {
  user: {
    id: string;
    name: string;
    photo: string | null;
  };
  joinedAt: string;
  isAdmin: boolean;
  progress: number;
  rating: number | null;
}

export const mockClubInteractions: ClubInteractions = {
  highlights: [
    {
      id: "highlight-1",
      text: "São as nossas escolhas que revelam o que realmente somos, muito mais do que as nossas qualidades.",
      page: 215,
      highlightCount: 42,
    },
    {
      id: "highlight-2",
      text: "O medo de um nome aumenta o medo da própria coisa.",
      page: 101,
      highlightCount: 37,
    },
    {
      id: "highlight-3",
      text: "A felicidade pode ser encontrada até mesmo nas horas mais sombrias.",
      page: 184,
      highlightCount: 58,
    },
    {
      id: "highlight-4",
      text: "Não vale a pena mergulhar nos sonhos e esquecer de viver.",
      page: 287,
      highlightCount: 31,
    },
  ],

  reviews: [
    {
      id: "review-1",
      user: {
        id: "user-1",
        name: "Ana Júlia Borges",
        photo: null,
      },
      rating: 5,
      review:
        "Uma releitura incrível. A construção do mistério continua me prendendo do início ao fim.",
    },
    {
      id: "review-2",
      user: {
        id: "user-2",
        name: "Lucas Martins",
        photo: null,
      },
      rating: 4,
      review:
        "Gostei bastante da evolução dos personagens. O final continua excelente.",
    },
    {
      id: "review-3",
      user: {
        id: "user-3",
        name: "Mariana Costa",
        photo: null,
      },
      rating: 5,
      review:
        "Foi meu livro favorito da série até agora. O clima de suspense é muito bom.",
    },
    {
      id: "review-4",
      user: {
        id: "user-4",
        name: "Pedro Henrique",
        photo: null,
      },
      rating: 4,
      review:
        "Achei o começo um pouco lento, mas depois a leitura fluiu muito.",
    },
  ],

  participantsProgress: [
    {
      user: {
        id: "user-1",
        name: "Ana Júlia Borges",
        photo: null,
      },
      joinedAt: "2026-01-18",
      isAdmin: true,
      progress: 100,
      rating: 5,
    },
    {
      user: {
        id: "user-2",
        name: "Lucas Martins",
        photo: null,
      },
      joinedAt: "2026-01-23",
      isAdmin: false,
      progress: 100,
      rating: 4,
    },
    {
      user: {
        id: "user-3",
        name: "Mariana Costa",
        photo: null,
      },
      joinedAt: "2026-02-05",
      isAdmin: false,
      progress: 82,
      rating: null,
    },
    {
      user: {
        id: "user-4",
        name: "Pedro Henrique",
        photo: null,
      },
      joinedAt: "2026-02-14",
      isAdmin: false,
      progress: 68,
      rating: null,
    },
    {
      user: {
        id: "user-5",
        name: "Beatriz Almeida",
        photo: null,
      },
      joinedAt: "2026-03-02",
      isAdmin: false,
      progress: 43,
      rating: null,
    },
    {
      user: {
        id: "user-6",
        name: "Gabriel Oliveira",
        photo: null,
      },
      joinedAt: "2026-03-19",
      isAdmin: false,
      progress: 21,
      rating: null,
    },
    {
      user: {
        id: "user-7",
        name: "Camila Rocha",
        photo: null,
      },
      joinedAt: "2026-04-08",
      isAdmin: false,
      progress: 100,
      rating: 5,
    },
    {
      user: {
        id: "user-8",
        name: "João Vitor",
        photo: null,
      },
      joinedAt: "2026-04-21",
      isAdmin: false,
      progress: 100,
      rating: 4,
    },
  ],
};
