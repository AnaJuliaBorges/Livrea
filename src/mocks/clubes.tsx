import type { Club, ClubParticipant } from "@/features/clubs/dtos";

export const recommendedClubs: Club[] = [
  {
    id: "1",
    name: "Clube Fantasia Viva",
    description:
      "Exploramos mundos mágicos, jornadas épicas e universos fantásticos.",
    isPrivate: true,
    participantLimit: 500,
    type: "leitura",
    frequency: "mensal",
    currentReading: {
      id: "book-1",
      title: "Harry Potter e a Câmara Secreta",
    },
    meetingDescription:
      "Encontros presenciais toda última quinta-feira do mês às 17h.",
    nextMeeting: {
      location: "Livraria da Travessa - Botafogo",
      date: "2026-07-30",
      time: "17:00",
      confirmedMembers: 10,
    },
    genres: [
      { id: 1, name: "Fantasia" },
      { id: 2, name: "Aventura" },
    ],
    cityName: "Rio de Janeiro",
    stateAbbreviation: "RJ",
    totalParticipants: 1240,
    rules: [
      "Respeite a opinião dos demais participantes.",
      "Evite spoilers antes da data da discussão.",
      "Mantenha um ambiente acolhedor e respeitoso.",
      "Participe sempre que possível dos encontros.",
    ],

    readingHistory: [
      {
        id: "book-2",
        cover: null,
      },
      {
        id: "book-4",
        cover: null,
      },
    ],
  },
  {
    id: "2",
    name: "Clube Mistério Urbano",
    description:
      "Suspense, thrillers e histórias que te prendem até a última página.",
    isPrivate: false,
    participantLimit: 300,
    type: "leitura",
    frequency: "quinzenal",
    currentReading: {
      id: "book-7",
      title: "O Código Da Vinci",
    },
    meetingDescription:
      "Encontros online quinzenais às quartas-feiras às 20h.",
    nextMeeting: {
      location: "Google Meet",
      date: "2026-07-22",
      time: "20:00",
      confirmedMembers: 250,
    },
    genres: [
      { id: 3, name: "Mistério" },
      { id: 4, name: "Suspense" },
    ],
    cityName: "São Paulo",
    stateAbbreviation: "SP",
    totalParticipants: 890,
    rules: [
      "Respeite a opinião dos demais participantes.",
      "Evite spoilers antes da data da discussão.",
      "Use a marcação de spoiler no chat.",
      "Mantenha as discussões focadas no livro.",
    ],

    readingHistory: [
      {
        id: "book-6",
        cover: null,
      },
    ],
  },
  {
    id: "3",
    name: "Clube Romance Contemporâneo",
    description: "Histórias de amor modernas, reais e cheias de emoção.",
    isPrivate: false,
    participantLimit: null,
    type: "leitura",
    frequency: "mensal",
    currentReading: {
      id: "book-5",
      title: "Orgulho e Preconceito",
    },
    meetingDescription:
      "Encontros presenciais no primeiro sábado do mês às 15h.",
    nextMeeting: {
      location: "Café com Letras",
      date: "2026-08-01",
      time: "15:00",
      confirmedMembers: 10,
    },
    genres: [{ id: 5, name: "Romance" }],
    cityName: "Belo Horizonte",
    stateAbbreviation: "MG",
    totalParticipants: 1520,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],

    readingHistory: [
      {
        id: "book-10",
        cover: null,
      },
    ],
  },
];

export const allClubs: Club[] = [
  ...recommendedClubs,

  {
    id: "4",
    name: "Clube Sci-Fi Orbit",
    description: "Exploração espacial, tecnologia e futuros possíveis.",
    isPrivate: true,
    participantLimit: 800,
    type: "leitura",
    frequency: "mensal",
    currentReading: {
      id: "book-3",
      title: "Duna",
    },
    meetingDescription: "Encontros online todas as segundas-feiras às 20h.",
    nextMeeting: {
      location: "Servidor Discord",
      date: "2026-07-13",
      time: "20:00",
      confirmedMembers: 300,
    },
    genres: [{ id: 6, name: "Ficção Científica" }],
    cityName: "Curitiba",
    stateAbbreviation: "PR",
    totalParticipants: 980,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    readingHistory: [
      {
        id: "book-11",
        cover: null,
      },
    ],
  },
  {
    id: "5",
    name: "Clube Poesia Viva",
    description: "Poemas clássicos e contemporâneos que tocam a alma.",
    isPrivate: false,
    participantLimit: 200,
    type: "leitura",
    frequency: "semanal",
    currentReading: {
      id: "book-9",
      title: "Antologia Poética",
    },
    meetingDescription: "Rodas de leitura todos os domingos às 10h.",
    nextMeeting: {
      location: "Parque Farroupilha",
      date: "2026-07-12",
      time: "10:00",
      confirmedMembers: 25,
    },
    genres: [{ id: 7, name: "Poesia" }],
    cityName: "Porto Alegre",
    stateAbbreviation: "RS",
    totalParticipants: 430,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    readingHistory: [
      {
        id: "book-12",
        cover: null,
      },
    ],
  },
  {
    id: "6",
    name: "Clube Clássicos Brasileiros",
    description: "Literatura brasileira em sua forma mais rica e histórica.",
    isPrivate: false,
    participantLimit: null,
    type: "leitura",
    frequency: "mensal",
    currentReading: {
      id: "book-8",
      title: "A Hora da Estrela",
    },
    meetingDescription:
      "Encontros presenciais na segunda terça-feira do mês às 19h.",
    nextMeeting: {
      location: "Biblioteca Pública da Bahia",
      date: "2026-07-14",
      time: "19:00",
      confirmedMembers: 1000,
    },
    genres: [
      { id: 8, name: "Clássicos" },
      { id: 9, name: "Literatura" },
    ],
    cityName: "Salvador",
    stateAbbreviation: "BA",
    totalParticipants: 670,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    readingHistory: [
      {
        id: "book-13",
        cover: null,
      },
    ],
  },
  {
    id: "7",
    name: "Clube Horror & Sombras",
    description: "Histórias sombrias, terror psicológico e suspense intenso.",
    isPrivate: true,
    participantLimit: 400,
    type: "leitura",
    frequency: "mensal",
    currentReading: {
      id: "book-6",
      title: "Drácula",
    },
    meetingDescription:
      "Encontros presenciais na última sexta-feira do mês às 21h.",
    nextMeeting: {
      location: "Café Sombrio",
      date: "2026-07-31",
      time: "21:00",
      confirmedMembers: 40,
    },
    genres: [{ id: 10, name: "Terror" }],
    cityName: "Recife",
    stateAbbreviation: "PE",
    totalParticipants: 760,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    readingHistory: [
      {
        id: "book-13",
        cover: null,
      },
    ],
  },
];

export const myClubs: Club[] = [
  {
    id: "1",
    name: "Clube Fantasia Viva",
    description:
      "Exploramos mundos mágicos, jornadas épicas e universos fantásticos.",
    isPrivate: true,
    participantLimit: 500,
    type: "leitura",
    frequency: "mensal",
    currentReading: {
      id: "book-1",
      title: "Harry Potter e a Câmara Secreta",
    },
    meetingDescription:
      "Encontros presenciais toda última quinta-feira do mês às 17h.",
    nextMeeting: {
      location: "Livraria da Travessa - Botafogo",
      date: "2026-07-30",
      time: "17:00",
      confirmedMembers: 50,
    },
    genres: [
      { id: 1, name: "Fantasia" },
      { id: 2, name: "Aventura" },
    ],
    cityName: "Rio de Janeiro",
    stateAbbreviation: "RJ",
    totalParticipants: 1240,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    readingHistory: [
      {
        id: "book-13",
        cover: null,
      },
    ],
  },

  {
    id: "2",
    name: "Clube Mistério Urbano",
    description:
      "Suspense, thrillers e histórias que te prendem até a última página.",
    isPrivate: false,
    participantLimit: 300,
    type: "leitura",
    frequency: "quinzenal",
    currentReading: {
      id: "book-7",
      title: "O Código Da Vinci",
    },
    meetingDescription:
      "Encontros online quinzenais às quartas-feiras às 20h.",
    nextMeeting: {
      location: "Google Meet",
      date: "2026-07-22",
      time: "20:00",
      confirmedMembers: 30,
    },
    genres: [
      { id: 3, name: "Mistério" },
      { id: 4, name: "Suspense" },
    ],
    cityName: "São Paulo",
    stateAbbreviation: "SP",
    totalParticipants: 890,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    readingHistory: [
      {
        id: "book-13",
        cover: null,
      },
    ],
  },
  {
    id: "3",
    name: "Clube Romance Contemporâneo",
    description: "Histórias de amor modernas, reais e cheias de emoção.",
    isPrivate: false,
    participantLimit: null,
    type: "leitura",
    frequency: "mensal",
    currentReading: {
      id: "book-5",
      title: "Orgulho e Preconceito",
    },
    meetingDescription:
      "Encontros presenciais no primeiro sábado do mês às 15h.",
    nextMeeting: {
      location: "Café com Letras",
      date: "2026-08-01",
      time: "15:00",
      confirmedMembers: 8,
    },
    genres: [{ id: 5, name: "Romance" }],
    cityName: "Belo Horizonte",
    stateAbbreviation: "MG",
    totalParticipants: 1520,
    rules: [
      "Respeite opiniões diferentes sobre os personagens.",
      "Evite spoilers antes da discussão oficial.",
      "Participe das votações dos próximos livros.",
    ],
    readingHistory: [
      {
        id: "book-13",
        cover: null,
      },
    ],
  },
];

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
