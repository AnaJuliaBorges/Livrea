import type { UserProfile } from "@/features/profile/dtos";

export const mockProfile: UserProfile = {
  id: "user-1",

  nome: "Ana Júlia Borges",
  username: "@anajborges",

  foto: "https://i.pravatar.cc/300?img=32",

  cidade: "Recife",
  estado: "PE",

  bio: "Apaixonada por fantasia, ficção científica e um bom mistério. Sempre em busca da próxima leitura que vai me prender madrugada adentro. 📚✨",

  amigos: [
    {
      id: "user-2",
      nome: "Marina Alves",
      username: "@marinaalves",
      foto: "https://i.pravatar.cc/300?img=45",
    },
    {
      id: "user-3",
      nome: "Lucas Martins",
      username: "@lucasm",
      foto: "https://i.pravatar.cc/300?img=12",
    },
    {
      id: "user-4",
      nome: "Beatriz Costa",
      username: "@bia.costa",
      foto: "https://i.pravatar.cc/300?img=23",
    },
    {
      id: "user-5",
      nome: "João Pedro",
      username: "@jpreads",
      foto: "https://i.pravatar.cc/300?img=18",
    },
  ],

  clubes: [
    {
      id: "1", // myClubs[0]
      nome: "Fantasia Sem Fronteiras",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      generos: ["Fantasia", "Aventura"],
      administrador: true,
      participantes: 87,
      limite_participantes: 100,
    },
    {
      id: "2", // myClubs[1]
      nome: "Mistérios à Meia-Noite",
      cidade: "São Paulo",
      estado: "SP",
      generos: ["Mistério", "Suspense"],
      administrador: false,
      participantes: 42,
      limite_participantes: 50,
    },
    {
      id: "3", // myClubs[2]
      nome: "Entre Páginas e Corações",
      cidade: "Belo Horizonte",
      estado: "MG",
      generos: ["Romance"],
      administrador: false,
      participantes: 124,
      limite_participantes: null,
    },
  ],

  biblioteca: {
    lidos: [
      {
        id: "book-5",
        titulo: "Orgulho e Preconceito",
        avaliacao_geral: 4.3,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
      {
        id: "book-6",
        titulo: "1984",
        avaliacao_geral: 4.19,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
    ],

    lendo: [
      {
        id: "book-1",
        titulo: "Harry Potter e a Câmara Secreta",
        avaliacao_geral: 4.45,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
    ],

    quero_ler: [
      {
        id: "book-2",
        titulo: "O Hobbit",
        avaliacao_geral: 4.3,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
      {
        id: "book-3",
        titulo: "Duna",
        avaliacao_geral: 4.28,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
      {
        id: "book-4",
        titulo: "E Não Sobrou Nenhum",
        avaliacao_geral: 4.27,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
    ],
  },
};
